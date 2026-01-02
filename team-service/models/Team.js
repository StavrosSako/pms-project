import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true},
    description: {type: String},
    leaderId: {type: Number, required: true},   //this will be the User ID from MySQL
    members: [{type: Number}],                  // Array of User IDs from MySQL
    createdAt: { type: Date, default: Date.now }
}); 

export default mongoose.model('Team', TeamSchema);

