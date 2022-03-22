CREATE TABLE account (
	id SERIAL PRIMARY KEY,
	name VARCHAR(80) NOT NULL
);

CREATE TABLE register (
	id SERIAL PRIMARY KEY,
  acct_id INTEGER REFERENCES account ON DELETE CASCADE NOT NULL,	amount MONEY NOT NULL
);

-- ** Let's create a new account with an initial balance of $1000.
-- We need to do two inserts, one into each table to do this.

-- 1) Create account
INSERT INTO account (name) VALUES('Abbey''s Savings Account');

-- 2) Add deposit of initial balance (Need acct_id for insert)
SELECT * FROM account;
INSERT INTO register (acct_id, amount) VALUES (1, 1000);
------------------------------------------------------------------

-- ** Another way to get the acct_id is to have the first insert 
-- return it using RETURNING. In Postico, we still have to plug 
-- in this value ourselves, but we'll be able to do it 
-- programmatically in JavaScript.

-- 1) Return id of inserted row to use for next query
INSERT INTO account (name) VALUES ('Abbey''s Checking Account') RETURNING id;
INSERT INTO register (acct_id, amount) VALUES (2, 100);
------------------------------------------------------------------

-- ** Now let's say that Abbey wants to move $500 from checking 
-- to savings...

-- 1) Take 500 out of checking
INSERT INTO register (acct_id, amount) VALUES (2, -500);

-- 2) Put 500 into savings
-- ! 11 is not a valid value
INSERT INTO register (acct_id, amount) VALUES (11, 500);

-- 3) Get current balances
SELECT account.name, SUM(amount) FROM account
JOIN register on account.id=acct_id
GROUP BY account.id;
------------------------------------------------------------------

-- ** The two queries to transfer money should be one logical unit, 
-- a single transaction. To keep our system data in a valid state, 
-- they must both happen or neither should happen. We want no 
-- disappearing money!
-- We can use a transaction to make sure this happens!

-- 1) Using database transactions it is all or nothing.
-- A transaction
BEGIN;
-- Take 500 out of checking
INSERT INTO register (acct_id, amount) VALUES (2, -500);
-- Put 500 into saving
INSERT INTO register (acct_id, amount) VALUES (1, 500);
-- Commit will save
COMMIT;

-- 2) When the error occurs on the 2nd insert, the first is undone
SELECT account.name, SUM(amount) FROM account
JOIN register on account.id=acct_id
GROUP BY account.id;
------------------------------------------------------------------

-- ** Write a new post to add an account with a starting balance 
-- amount. This requires an INSERT into the account table that 
-- returns an id & an additional INSERT into the register table 
-- using the returned account id.

-- 3) Return back the generated id value
INSERT INTO account (name) VALUES ('Chad''s Savings Account') RETURNING id;
-- 4) Then we need to plug it into the next insert... How?
INSERT INTO register (acct_id, amount) VALUES (???, 1000);