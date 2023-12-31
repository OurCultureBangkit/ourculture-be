const express = require('express');
const authenticatedJWT = require('../../middleware/AuthenticatedJWT');
const { getWhoAmI, getProfileByUsername, changeUserPassword } = require('../../controller/user');
const { getMyPostBarang, deleteMyBarang } = require('../../controller/barang');

const router = express();

router.get("/whoami", authenticatedJWT, getWhoAmI);
router.get("/:username", authenticatedJWT, getProfileByUsername);

router.put("/change-password", authenticatedJWT, changeUserPassword);

router.get("/market/barang", authenticatedJWT, getMyPostBarang);
router.delete("/market/barang/:barangId", authenticatedJWT, deleteMyBarang);

module.exports = router;