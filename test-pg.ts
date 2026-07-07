import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.xaaijapxgbzvpfjhcbxa:Truong102005vn@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  });

  try {
    await client.connect();
    console.log("Connected successfully to PostgreSQL!");
    const res = await client.query('SELECT NOW()');
    console.log("Time from DB:", res.rows[0]);
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

main();
