const express = require('express');
const router = express.Router();

const pool = require('../modules/pool');

// Setup a GET route to get all the accounts & balances
router.get('/', (req, res) => {
  const sqlText = `
  SELECT account.name, SUM(amount) 
  FROM account
  JOIN register on account.id=acct_id
  GROUP BY account.id;`;

  pool.query(sqlText)
    .then(result => {
      console.log('Got the balances', result.rows);
      res.send(result.rows);
    })
    .catch(error => {
      console.log('Query error:', sqlText, error);
      res.sendStatus(500); // Good server always responds
    })
})

// Setup POST route for money transfer
// Need *async* function to *await* completion of each query
router.post('/transfer', async (req, res) => {
  // * Store req.body variables
  const toId = req.body.toId; // Account money is going to
  const fromId = req.body.fromId; // Account money is coming from
  const amount = req.body.amount; // Actual amount being transferred
  console.log(`Transfer ${amount} from acct ${fromId} to acct ${toId}`);
  
  // We need to use the same connection for all queries
  const connection = await pool.connect()

  // Using basic JavaScript try/catch/finally
  try {
    // Use the connection we just initialized
    await connection.query('BEGIN');
    // Need sqlText to insert
    const sqlText = `INSERT INTO register (acct_id, amount) VALUES ($1, $2)`;
    // Use - amount & from account for withdraw
    await connection.query(sqlText, [fromId, -amount]);
    // Use + amount & to account for deposit
    await connection.query( sqlText, [toId, amount]);
    // Commit
    await connection.query('COMMIT');
    // If this works send status code of 200
    res.sendStatus(200);
  } catch (error) {
    // Create the ROLLBACK for if there is an error in above sql
    await connection.query('ROLLBACK');
    console.log(`Transaction error - Rolling back transfer`, error);
    res.sendStatus(500);
  } finally {
    // Always runs - both after successful try & after catch
    // Put the client connection back in the pool
    // This is super important!
    connection.release();
  }
});


// Setup POST route for new account with an initial balance
router.post('/new', async (req, res) => {
  // * Store req.body variables
  const name = req.body.name;
  const amount = req.body.amount;
  console.log(`Creating new account ${name} with initial balance ${amount}`);
  
  // We need to use the same connection for all queries
  const connection = await pool.connect();
  
  // Using basic JavaScript try/catch/finally
  try {
    // Use the connection we just initialized
    await connection.query('BEGIN');
    // Need sqlText to insert the new account
    const sqlAddAccount = `INSERT INTO account (name) VALUES ($1) RETURNING id`;
    // Save the result so we can get the returned value
    const result = await connection.query( sqlAddAccount, [name]);
    // Get the id from the result - will have 1 row with the id
    const accountId = result.rows[0].id;
    // Need sqlText to insert the initial balance of the account
    const sqlInitialDeposit = `INSERT INTO register (acct_id, amount) VALUES ($1, $2);`  
    // Send this query with the sqlText and the account id from result.rows with the amount
    await connection.query( sqlInitialDeposit, [accountId, amount]);
    // Now we commit the about sql inserts
    await connection.query('COMMIT');
    // If successful, send the status of 200
    res.sendStatus(200);
  } catch ( error ) {
    // If there is an error, we will ROLLBACK what we tried to insert
    await connection.query('ROLLBACK');
    // Console log the rollback error
    console.log(`Transaction Error - Rolling back new account`, error);
    // Send back status of 500 showing it was a server error
    res.sendStatus(500);
  } finally {
    // Always release the connection
    // Puts the client connection back in the pool
    connection.release()
  }
})

module.exports = router;
