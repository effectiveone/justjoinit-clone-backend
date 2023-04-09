const mongoose = require("mongoose");

let schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
    },
    title: {
      type: String,
      // required: true,
    },
    remote: {
      type: Boolean,
      // required: true,
    },
    locations: {
      type: [String],
      // required: true,
    },
    description: {
      type: String,
      // required: true,
      maxlength: 2000,
    },
    techStack: {
      type: [
        {
          name: {
            type: String,
            // required: true,
          },
          value: {
            type: Number,
            // required: true,
            validate: {
              validator: Number.isInteger,
              msg: "Value should be an integer",
            },
          },
        },
      ],
      // required: true,
    },
    companySize: {
      type: Number,
      // required: true,
      validate: [
        {
          validator: Number.isInteger,
          msg: "Company size should be an integer",
        },
        {
          validator: function (value) {
            return value > 0;
          },
          msg: "Company size should be greater than 0",
        },
      ],
    },
    seniority: {
      type: String,
      // required: true,
    },

    maxApplicants: {
      type: Number,
      validate: [
        {
          validator: Number.isInteger,
          msg: "maxApplicants should be an integer",
        },
        {
          validator: function (value) {
            return value > 0;
          },
          msg: "maxApplicants should be greater than 0",
        },
      ],
    },
    maxPositions: {
      type: Number,
      validate: [
        {
          validator: Number.isInteger,
          msg: "maxPostions should be an integer",
        },
        {
          validator: function (value) {
            return value > 0;
          },
          msg: "maxPositions should be greater than 0",
        },
      ],
    },
    activeApplications: {
      type: Number,
      default: 0,
      validate: [
        {
          validator: Number.isInteger,
          msg: "activeApplications should be an integer",
        },
        {
          validator: function (value) {
            return value >= 0;
          },
          msg: "activeApplications should be greater than or equal to 0",
        },
      ],
    },
    acceptedCandidates: {
      type: Number,
      default: 0,
      validate: [
        {
          validator: Number.isInteger,
          msg: "acceptedCandidates should be an integer",
        },
        {
          validator: function (value) {
            return value >= 0;
          },
          msg: "acceptedCandidates should be greater than or equal to 0",
        },
      ],
    },
    dateOfPosting: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      validate: [
        {
          validator: function (value) {
            return this.dateOfPosting < value;
          },
          msg: "deadline should be greater than dateOfPosting",
        },
      ],
    },
    jobType: {
      type: String,
      // required: true,
    },
    duration: {
      type: Number,
      min: 0,
      validate: [
        {
          validator: Number.isInteger,
          msg: "Duration should be aninteger",
        },
      ],
    },
    disclosedSalary: {
      type: Boolean,
      required: true,
    },
    salary: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      max: 5.0,
      default: -1.0,
      validate: {
        validator: function (v) {
          return v >= -1.0 && v <= 5.0;
        },
        msg: "Invalid rating",
      },
    },
  },
  { collation: { locale: "en" } }
);

module.exports = mongoose.model("jobs", schema);
