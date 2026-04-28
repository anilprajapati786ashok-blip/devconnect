const Profile = require("../models/Profile");

async function updateProfileStats(userId, score) {
  let profile = await Profile.findOne({ userId });

  if (!profile) {
    profile = await Profile.create({ userId });
  }

  profile.totalInterviews += 1;

  if (score > profile.bestScore) {
    profile.bestScore = score;
  }

  profile.avgScore = Math.round(
    (profile.avgScore * (profile.totalInterviews - 1) + score) /
      profile.totalInterviews
  );

  if (profile.avgScore > 80) profile.level = "advanced";
  else if (profile.avgScore > 60) profile.level = "intermediate";
  else profile.level = "beginner";

  await profile.save();

  return profile;
}

module.exports = { updateProfileStats };