import mongoose from 'mongoose';

export interface User extends mongoose.Document {
    _id: String,
    name: String,
    email: String,
    description: String,
    password: String,
    permissionLevel: Number
}

export class MongooseService {
    private static instance: MongooseService;

    options = {
        autoIndex: false,
        poolSize: 10,
        bufferMaxEntries: 0,
        useNewUrlParser: true,
        useUnifiedTopology: true
    };
    count = 0;

    constructor() {
        this.connectWithRetry();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new MongooseService();
        }
        return this.instance;
    }

    getMongoose() {
        return mongoose;
    }


    connectWithRetry() {
        console.log('MongoDB connection with retry');
        mongoose.connect("mongodb://mongo:27017/api-db", this.options).then(() => {
            console.log('MongoDB is connected')
        }).catch(err => {
            console.error(err)
            console.log('MongoDB connection unsuccessful, retry after 5 seconds. ', ++this.count);
            setTimeout(this.connectWithRetry, 5000)
        })
    };

}