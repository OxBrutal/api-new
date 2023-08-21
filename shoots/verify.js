const express = require('express');
const router = express.Router();

const { notAuthenticated } = require('../lib/auth');
const { verifyUser } = require('../place/db'); 

router.get('/', notAuthenticated, (req, res) => {
  res.redirect('/users/login');
})

router.get('/verify', notAuthenticated, async (req, res, next) => {
  const id = req.query.id;
  const check = await verifyUser(id);
  if (!check) {
      req.flash('erorr_msg', 'Fail Maybe Id Not Correct'); 
      res.redirect('/users/login');
  } else {
      req.flash('success_msg', 'Your Account Has Been Verified By Dani');
      res.redirect('/users/login');
  }
});

module.exports = router;
