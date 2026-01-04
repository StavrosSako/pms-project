import mongoose from 'mongoose';

const ProjectTeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  projectId: {
    type: String,
    default: undefined
  },
  createdBy: {
    type: String,
    required: true
  },
  members: [{
    userId: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['TEAM_LEADER', 'TEAM_MEMBER'],
      default: 'TEAM_MEMBER'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ProjectTeamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

ProjectTeamSchema.index(
  { projectId: 1 },
  {
    unique: true,
    partialFilterExpression: { projectId: { $type: 'string' } }
  }
);

export default mongoose.model('ProjectTeam', ProjectTeamSchema);
