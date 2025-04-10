module.exports = function (app) {
    // Résoudre le problème process.env dans axios
    process.env.REACT_APP_API_URL = 'http://localhost:8000';
  };