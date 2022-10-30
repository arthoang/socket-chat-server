import mongodb from 'mongodb';
const MongoClient = mongodb.MongoClient;

/* =====DB connections===== */
let client;
let db = () => client.db(process.env.MONGO_DBNAME);

export const connectDB = async () => {
    if (!client) {
        client = await MongoClient.connect(process.env.MONGO_URL);
    }
    return db;
}

export async function closeDB() {
    if (client) client.close();
    client = undefined;
}

