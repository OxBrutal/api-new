const express = require('express');
const app = express();
const session = require('express-session'); 
const cookieParser = require('cookie-parser');
const expressLayout = require('express-ejs-layouts');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const flash = require('connect-flash');
const MemoryStore = require('memorystore')(session);
const compression = require('compression');
const ms = require('ms');

const apiRouters = require('./shoots/api');
const userRouters = require('./shoots/users');
const verifyRouters = require('./shoots/verify');
const premiumRouters = require('./shoots/premium');

const { User } = require('./place/model')
const { checkUsername, checkAdmin } = require('./place/db');
const { connectMongoDb } = require('./place/connect');
const { getTotalUser, cekExpiredDays } = require('./place/premium');
const { isAuthenticated } = require('./lib/auth');
const { port } = require('./lib/settings');

const PORT = process.env.PORT || port;

connectMongoDb();

app.set('trust proxy', 1);
app.use(compression())

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 2000, 
  message: 'Oops too many requests'
});
app.use(limiter);

app.set('view engine', 'ejs');
app.use(expressLayout);
app.use(express.static('public'));

app.use(session({
  secret: 'secret',  
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000
  }),
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());
require('./lib/config')(passport);

app.use(flash());

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
})

app.get('/', (req, res) => {
  res.render('index', {
    layout: 'index'
  })
})

app.get('/docs', isAuthenticated, async (req, res) => { 
  let userjid = await getTotalUser()
  let { apikey, username, email, totalreq } = req.user
  res.render('docs', {
    username: username,
    apikey: apikey,
    email,
    user: userjid,
    totalreq,
    layout: 'docs'
  });
});

app.get('/profile', isAuthenticated, async (req, res) => { 
  let { apikey, username, limit, premium, email, totalreq, nomorWa } = req.user
  let cekexp = ms(await cekExpiredDays(username) - Date.now())
  let expired = '0 d'
  if (cekexp !== null) {
    expired = cekexp
  }
  res.render('profile', {
      username,
      apikey,
      limit,
      premium,
      email,
      totalreq,
      nomorWa,
      expired,
      layout: 'profile'
    });
});

app.post('/profile', async (req, res, next) => {
    let { email } = req.user
    let { username } = req.body
    let checkUser = await checkUsername(username);
    if (checkUser) {
         req.flash('error_msg', 'Username already exists.');
         res.redirect('/profile');
    } else {
    if (username !== null) User.updateOne({email: email}, {username: username}, function (err, res) { if (err) throw err;})
         req.flash('success_msg', 'Succesfully changed username');
         res.redirect('/profile')
    }
})

app.get('/changelog', isAuthenticated, async (req, res) => { 
  let { username, email } = req.user
  res.render('changelog', {
    username: username,
    email,
    layout: 'changelog'
  });
});

app.get('/pricing', isAuthenticated, async (req, res) => { 
  let { username, email } = req.user
  res.render('pricing', {
       username,
       email,
       layout: 'pricing'
   })
})

app.get('/about', async (req, res) => { 
  res.render('about', {       
       layout: 'about'
   })
})

app.get('/admin/listuser', isAuthenticated, async (req, res) => {
  let { username, email } = req.user
  let List = await User.find({})
  if (username !=='KirBotz') return res.redirect('/docs');
  res.render('admin/listuser', {
       List,
       username,
       email,
       layout: 'admin/listuser'
  })
})

app.get('/admin/index', isAuthenticated, async(req, res) => {
  let { username, email } = req.user
  if (username !=='KirBotz') return res.redirect('/docs');
  res.render('admin/index', {
       username,
       email,
       layout: 'admin/index'
  })
})


app.use('/api', apiRouters);
app.use('/users', userRouters);
app.use('/verification', verifyRouters);
app.use('/premium', premiumRouters);

app.use(function (req, res, next) {
  if (res.statusCode == '200') {
    res.render('notfound', {
      layout: 'notfound'
    });
  }
});

app.set('json spaces', 4);

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});