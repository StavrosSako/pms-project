import mongoose from 'mongoose'; 

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true},
    description: { type: String },                 //MySQL User ID
    assignedTo: { type: String, required: true}, //MongoDB Team ID
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    status: {
        type: String,
        enum: ['TODO', 'IN PROGRESS', 'DONE'], 
        default: 'TODO'
    },
    deadline: {type: Date},
    createdAt: {type: Date, default: Date.now}

});

export default mongoose.model('Task', TaskSchema);