const express = require('express')
const router = express.Router()
const fs = require('fs')

router.use(function (req, res, next) {
        if (res.statusCode == '200') {
             res.render('notfound', {
             layout: 'notfound'
        })
     }
})

module.exports = router