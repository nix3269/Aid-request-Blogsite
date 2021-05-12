const functions = require("firebase-functions");
const express = require('express');
const engines = require('consolidate');
const { v4: uuidv4 } = require('uuid');
var hbs = require('handlebars');
const admin = require('firebase-admin');
const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');
admin.initializeApp(functions.config().firebase);

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

exports.app = functions.https.onRequest(app);
