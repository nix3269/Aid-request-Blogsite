function loadnewpage(page) {
    var card = document.getElementById('p');
    var location = sessionStorage.getItem("curr");
    fetch('/page?page=' + String(page) + '&location=' + location).then(res => res.json()).then(data => {
        if (!data.__proto__) {
            data.forEach(doc => {
                const { phone1, phone2, location, product, quantity } = doc;
                const post = document.createElement('div');
                post.classList.add('card');
                post.innerHTML = `
            <div class="card">
                <h1>${product}</h1><br>
                <h3>${name}</h3><br>
                <p>Qty: ${quantity}</p><br>
                <p>Contact 1:${phone1}</p>
                <p>Contact 2: ${phone2}</P><br>
                <p>Location: ${location}<p><br>
                        <p class="date">Date: ${date}</p>
            </div>
        `
                card.appendChild(post);//apppends to main
            })
        }
    })
}

function verify() {
    var pass1 = document.getElementById("pass1")
    var pass2 = document.getElementById("pass2")
    pass1 = pass1.value
    if (pass1.value != pass2.value) {
        
    } else {
        
    }
}