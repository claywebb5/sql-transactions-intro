<!--===========<SQL TRANSACTIONS>==============-->
- A transaction in a database, is a logical unit that is independently executed for data retrieval or updates.
- Transactions ensure that multiple related database queries happen as a group.

<!--===========<ACID>==============-->
- A: Atomicity - A transaction must be fully complete, saved   (committed) or completely undone (rolled back). It's all or nothing
- C: Consistency - The transaction must be fully compliant with the state of the database as it was prior to the transaction. (No breaking database constraints.)
- I: Isolation - Transaction data is unavailable outside it's transaction until it's committed or rolled back.
- D: Durability - Transaction data changes must be available, even in the event of database failure.

## Important considerations using transactions with pg

- Must use the same client connection from the connection pool.
- Start transaction with BEGIN
- Must say ROLLBACK (error) or COMMIT (success)
- Return the connection to the pool whether transaction fails or succeeds.
- Syntax is easier using JavaScript async/await

<!--=========<ASYNC/AWAIT>===========-->
- JavaScript's async/await behaves much like code using promises, but using try/catch syntax instead of then/catch with callback functions. For when you need to do multiple things!

# Note that we must:
- Start the transaction
    - 'BEGIN'
- Do the things
    - 'INSERT INTO ...'
- COMMIT when done
    - 'COMMIT'
- ROLLBACK if there is an error
    - 'ROLLBACK'

<!--=========<NEW ACCOUNT WITH INITIAL BALANCE>===========-->
- Write a new post to add an account with a starting balance amount.


