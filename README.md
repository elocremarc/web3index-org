# The Web3 Index

### Method #2: The Web3 Index Database

If a protocol's blockchain is not supported by The Graph, you can index its revenue data using the Web Index's own database.

Step 1: Create a command line script inside `cmd/[your_protocol_name].ts`. This endpoint will get called every hour by a Github action (create your Github action in `.github/workflows/[your_protocol_name].yml`). When executed, it should store the protocol's paid fees using the [Prisma](https://www.prisma.io/docs/concepts/components/prisma-client/crud) ORM according to the database [schema](./prisma/schema.prisma).

Step 2: Add your protocol to the Web3 Index [registry](./registry.json) using the protocol and directory name you created. Make sure to set the set its `subgraph` field to `false`.

## Running App Locally

First, install the project dependencies:

```bash
yarn
```

Next, rename `.env.example` to `.env` and replace `DATABASE_URL` with your own Postgres database url.
replace `INFURA_API_KEY` with your own Infura API key.

Finally, run the app:

After that, run the Prisma ORM database schema migration tool:

```bash
npx prisma migrate dev --name init
```

run revenue script

```bash
node wildcredit.js
```

Finally, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
