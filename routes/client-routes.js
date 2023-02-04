const express = require("express");
const clientControllers = require("../controllers/client-controller");
const { check } = require("express-validator");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.post("/", clientControllers.addClient);

router.post("/:cid", clientControllers.addClientSession);

router.delete("/:sid", clientControllers.deleteClientSession);

module.exports = router;