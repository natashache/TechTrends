var crunch = {}

utilities.parseTechnologies = function(str) {
  var hasTechnologies = {};
  Object.keys(technologyPatterns).forEach(function(technology) {
    hasTechnologies[technology] = technologyPatterns[technology].test(str);
  });
  return hasTechnologies;
};

module.exports = crunch;
