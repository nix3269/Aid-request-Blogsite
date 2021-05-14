const admin = require("firebase");
// const functions = require("firebase-functions");
const express = require('express');
const engines = require('consolidate');
const { v4: uuidv4 } = require('uuid');
var hbs = require('handlebars');
const port = 5000;
let bodyParser = require('body-parser');
// const admin = require('firebase-admin');
const app = express();

app.use(express.static('public'));

app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');
admin.initializeApp({
    projectId: "covid-forum",
    databaseURL: 'https://covid-forum.firebaseio.com',
    serviceAccount: {
      projectId: "covid-forum",
      clientEmail: 'firebase-adminsdk-ovb6r@covid-forum.iam.gserviceaccount.com',
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCllb2xizDSjf/M\n52cWXmHbD5p0CXzr7DgazuYoF1sEp5x5jdYveXc9JjJz/UuhM9daixW1riKRGNFY\nnFaYzwS2SpmpiJDWj9fxsXCFVFR33PUUlec/r5K6HgcUa5KuSh8shZpVMjn8UJKy\n7SFOAoD+iX812Ea8taEgChWbSQyWPZU2EORK2fzEavIX+5Auo++8iHSyA6eBasY/\nQEKq6NkTZHOAgyhAJGbny7Z/6o/2KgajlhlL244/kfdklB+AdWeprk9fXjS7gxKj\nL9twkA0puHAGdXpzW5j7NQc9ml2spDNfV+jW2ZMbhQGDhJkZ8fgn0YOQDzP6dgBa\ngHg8SLBRAgMBAAECggEAOW2VJEHzlVr1WFH7QVlLlAe12D/AKSy8iqOuVEJBaXxe\nOxQzsDRu4/De97ZmKAsMShVJ2sCBsZQLazGRoR7Pcg+ueotoPFoYGXWiYkOMpiOm\nhlS1JrPUbiNi7jSe4z7G0BCoJZstXDJvpomyjtU0etMiIQEZC3Ls5mlI9BniOSqk\nw39VWIxAOk62t09l1ZssjGu3AvJQrPRgpkJ10tCgCDrix1Kr+Qo8SCkj/gVoT51D\ndDw3lqhuDp+wWfjpbHkqfBY5CRzimx5BPdlKC/dnYze8jrenA2I1GQ1Kg+p1RpgL\neW3j5QxUE7f9WMU6RWw9Bq9sVodUqrgm5NzxrL59LwKBgQDRVhIhNje6BWtnKcpP\n4IfL5Y/AY1VqCREfN8zN9Z+/A91gp5/F+BKNvZxBbl1umPmHxSiB2CSeKIhZXcsa\n9v4KdcfxWBm2AWMfhZX0IJbKqXgn8AeQHvOeD5ENyFlx2LFoLU3ObWNgcR/6h5ig\nDlX/XtYHLaZHz+hJYEbQYK3HEwKBgQDKfvhIMUY3nK+7yeKZy17ArhzE1XXEPplf\nAcjWxtbgDvFg3OpOqL+B3JLZwz3TFL1xv2K4IflTFxo1M28bcP2xBLNLWFgrOVF5\nZXa4Lg/IFUwX4JchGz0lx0vhhaQzk97EfRuyouZkT9n5jkbRooD5qKiOkaOPgu4P\n2lBJvjIjiwKBgEgnL5aM9oZCqfNj/xyrGoNX+8VnN6CVwXYOKKRw3f/b2Ckhfbuh\ntttuGHahEMk3JwL6HO0sT+rHs7+Byajgq011rVXtdOc78SuDQt1jgjYWVZkGbcTq\nNjQrz2Z9wP6xnux2eRQGtjMeqtQSerPoXRHpYUIWJPMpoTnxWlcmi59LAoGAajF2\nAV4d5dI88q1oMaFOmpt0qOEM9pKhmgp0ifYS/8O2YEbadc/XRsInHR5f0M+ingFx\nQwFGIIYQD3BexzRVRr0hTdURv/E6QgCs5t/5FMPeePMmLo17XtGKgMW2G/pjLAY0\nPVVin56kwFQV3aBsJQGHC+ViskNGl3e0/UdKQgsCgYBAeGPywPjXLVz/E4WhiVmy\noUU6E2e1nDoFEzv1wBHjOSuSNkjqFlnVaEOPWjI4tYQIpYlpASOq5RhiWlDIlpVS\nvolpJ2Im8gtjOaXYCDacgEMqq25pnfuQQLoLQ9djVAPop1fVFpQaDwqhTRwQBFFF\n0OKWEER8GQUSY73DKLoy4Q==\n-----END PRIVATE KEY-----\n"
    }
  })

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));

async function getFirestore(request, loc) {
    const firestore_con = await admin.firestore();
    if (!loc) {
        loc = "Canacona"
    }
    const posts = firestore_con.collection("posts");
    const snapshot = await posts.limit(9).where('location', '==', loc).get();
    writeResult = []
    if (snapshot.empty) {
        console.log('No matching documents.');
        return "Empty";
    }
    snapshot.forEach(doc => {
        writeResult.push(doc.data())
    });
    return writeResult
}

async function filterLocation(request) {
    const firestore_con = await admin.firestore();
    const posts = firestore_con.collection("posts");
    if (request.body.product == "") {
        const snapshot = await posts.limit(9).where('location', '==', request.body.location).get();
        writeResult = []
        if (snapshot.empty) {
            console.log('No matching documents.');
            return "Empty";
        }
        snapshot.forEach(doc => {
            writeResult.push(doc.data())
        });
        return writeResult
    } else {
        const snapshot = await posts.limit(9).where('location', '==', request.body.location).where('product', '==', request.body.product).get();
        writeResult = []
        if (snapshot.empty) {
            console.log('No matching documents.');
            return "Empty";
        }
        snapshot.forEach(doc => {
            writeResult.push(doc.data())
        });
        return writeResult
    }

}


async function insertFormData(request) {
    var today = new Date();
    const writeResult = await admin.firestore().collection('posts').add({
        name: request.body.name,
        id: request.body.id,
        location: request.body.location,
        phone1: request.body.phone1,
        phone2: request.body.phone2,
        product: request.body.product,
        quantity: request.body.quantity,
        date: String(today.getDate()).padStart(2, '0') + "/" + String(today.getMonth() + 1).padStart(2, '0') + "/" + today.getFullYear()
    })
        .then(function () { console.log("Document successfully written!"); })
        .catch(function (error) { console.error("Error writing document: ", error); });
}

async function Signup(request) {
    const writeResult = await admin.firestore().collection('users').add({
        userid: uuidv4(),
        name: request.body.name,
        pass: request.body.password,
        phone: request.body.phone,
        email: request.body.email,
        location: request.body.location
    })
        .then(function () { return ("done") })
        .catch(function (error) { console.error("Error writing document: ", error); });
}

async function VerifyUser(req) {
    if (!req.body.email) {
        return
    }
    if (!req.body.pass) {
        return
    }
    const firestore_con = await admin.firestore();
    const snapshot = await firestore_con.collection('users').where('email', "==", req.body.email).where('pass', "==", req.body.pass).get();
    snapshot.forEach(doc => {
        return (doc.data());
    });
    return
}

async function UpdatePass(req) {
    const firestore_con = await admin.firestore();
    if (!req.body.phone) {
        return
    }
    if (!req.body.pass) {
        return
    }
    const writeResult = firestore_con.collection('users').where('phone', "==", request.body.phone).set({ pass: request.body.pass });
    return writeResult
}

app.get('/', async (request, response) => {
    response.render('login', {});
});

app.post('/', async (request, response) => {
    const firestore_con = await admin.firestore();
    const snapshot = await firestore_con.collection('users').where('email', "==", request.body.email).where('pass', "==", request.body.pass).get();
    if (snapshot.empty) {
        response.render("login", { message: "Email or Password Incorrect" });
    } else {
        snapshot.forEach(doc => {
            l = doc.data()
        })
        if (l) {
            var db_result = await getFirestore(request, l.location);
            response.render('index', {
                res: db_result, id: l.userid, name: l.name, location: l.location
            });
        } else {
            response.render("login", { message: "Email or Password Incorrect" });
        }
    }
});

app.get('/sign', async (request, response) => {
    response.render('signup', {});
});

app.post('/load', async (request, response) => {
    var db_result = await filterLocation(request);
    response.render('index', {
        res: db_result
    });
});

app.get('/load', async (request, response) => {
    var db_result = await getFirestore(request, request.query.location);
    response.render('index', {
        res: db_result
    });
});

app.post('/signup', async (request, response) => {
    if (request.body.email && request.body.password && request.body.phone && request.body.location && request.body.name) {
        x=String(request.body.password)
        y=String(request.body.phone)
        if(x.length<8){
            response.render('signup', { message3: "*Password should be 8 or more characters" });
        }else if(y.length!=10){ 
            response.render('signup', { message4: "*Invalid Phone Number" });
        }else{
            const firestore_con = await admin.firestore();
        const snapshot = await firestore_con.collection('users').where('email', "==", request.body.email).get();
        if (snapshot.empty) {
            Signup(request)
            response.render('login', {})
        } else {
            response.render('signup', { message2: "Email Already Exists" });
        }
        }
        
    } else {
        response.render('signup', { message1: "Wrong Details" });
    }
});

app.get('/postitem', async (request, response) => {
    response.render('postitem', {});
});

app.post('/insert_data', async (request, response) => {
    if(!request.body.product || !request.body.name || !request.body.quantity || !request.body.location){
        res.send({message: "Wrong Details given"})
    }
    var insert = await insertFormData(request);
    response.render('postitem', {done: "Post Successful!"});
});

app.post('/page', async (request, response) => {
    x=1
    const firestore_con = await admin.firestore();
    const posts = firestore_con.collection("posts");
    const snapshot = await posts.limit(parseInt(request.body.page) + 9).where('location', '==', request.body.location).get();
    writeResult = []
    if (snapshot.empty) {
        console.log('No matching documents.');
        response.send({})
    } else {
        snapshot.forEach(doc => {
            if (x > parseInt(request.body.page)) {
                if (doc.exists) {
                    writeResult.push(doc.data())
                }
            }
            x++;
        });
        response.render('index', {
            res: writeResult, page: "sss"
        });
    }
});

var listener = app.listen(port, function () {
    console.log('Your app is listening on port ' + listener.address().port);
  });

