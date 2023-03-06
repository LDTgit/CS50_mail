document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // On sumbit send the email
  document.querySelector('form').onsubmit = function(event) {
    //stop refresh before loading the sent mailbox
    event.preventDefault();

    // POST request to /emails, passing in values for recipients, subject, and body
    const recipients = document.querySelector('#compose-recipients').value 
    const subject = document.querySelector('#compose-subject').value
    const body = document.querySelector('#compose-body').value
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    //Once the email has been sent, load the user’s sent mailbox
    .then(response => load_mailbox('sent'));
  }
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  //Delete previous emails
   document.querySelector('#emails-view').replaceChildren();
    
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  //Show each mailbox
  if (mailbox ==="inbox") {
    get_emails_inbox();
  } else if (mailbox === "sent") {
    get_emails_sent();
  } else if (mailbox === "archive") {
    get_emails_archive();
  };
};


// Create function to retrive the inbox list
function get_emails_inbox(){
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
    emails.forEach (email => {
      if (email['archived'] === false){
        // Each email should then be rendered in its own box (e.g. as a <div> with a border) 
        const newDiv = document.createElement("div");
        newDiv.id='email_container';
        newDiv.value=`${email['id']}`;

        // display who the email is from, what the subject line is, and the timestamp of the email.
        newDiv.innerHTML = 
          `<div style="display: flex; justify-content: space-between;">
            <div style="padding: 8px">${email['sender']} </div>
            <div style="padding: 8px">${email['subject']}</div>
          </div>
          <div style="padding: 8px">${email['timestamp']}</div>`;
        document.getElementById("emails-view").appendChild(newDiv);

        //Open mail when clicked and mark it as read
        newDiv.onclick = event => openMail(email['id']);

        //Display unread mails in bold
        if (email['read']===false){
          newDiv.style.fontWeight = "700";
          newDiv.style.backgroundColor = "white";
        };

        //Create button to mark as unread
        if (email['read']===true){
          newDiv.style.backgroundColor = "rgb(159 162 165 / 36%)";
          newDiv.style.boxShadow = "rgb(0 0 0 / 14%) 2px 8px 10px 2px";
          const unread = document.createElement("button");
          unread.role = "button";
          unread.id='unread';
          unread.innerHTML = 'Mark as unread';
          document.getElementById("emails-view").appendChild(unread);

          unread.onclick = function (event){
            let id = email['id'];
              fetch('/emails/' + id, {
                method: 'PUT',
                body: JSON.stringify({
                    read: false
                })
              }).then(response => load_mailbox('inbox'))
          };
        };        
      };
    });
  });
}

// Create function to retrive the sent list
function get_emails_sent(){
  fetch('/emails/sent')
  .then(response => response.json())
  .then(emails => {
    emails.forEach (email => {
      console.log(email);
      // Each email should then be rendered in its own box (e.g. as a <div> with a border) 
      const newDiv = document.createElement("div");
      newDiv.id='email_container';
      newDiv.value=`${email['id']}`;
      // display the recipient, what the subject line is, and the timestamp of the email.
      newDiv.innerHTML = 
        `<div style="display: flex; justify-content: space-between;">
          <div style="padding: 8px">${email['recipients']} </div>
          <div style="padding: 8px">${email['subject']}</div>
        </div>
        <div style="padding: 8px">${email['timestamp']}</div>`;
      document.getElementById("emails-view").appendChild(newDiv);
      //Open mail when clicked
      newDiv.onclick = event => openMail(email['id']);
      });
  });
}

//Create function to retrive the archive list
function get_emails_archive(){
  fetch('/emails/archive')
  .then(response => response.json())
  .then(emails => {
    emails.forEach (email => {
      if (email['archived'] === true){
        console.log(email);
        // Each email should then be rendered in its own box (e.g. as a <div> with a border) 
        const newDiv = document.createElement("div");
        newDiv.id='email_container';
        newDiv.value=`${email['id']}`;
        // display who the email is from, what the subject line is, and the timestamp of the email.
        newDiv.innerHTML = 
          `<div style="display: flex; justify-content: space-between;">
            <div style="padding: 8px">${email['sender']} </div>
            <div style="padding: 8px">${email['subject']}</div>
          </div>
          <div style="padding: 8px">${email['timestamp']}</div>`;
        document.getElementById("emails-view").appendChild(newDiv);
        //Open mail when clicked and mark it as read
        newDiv.onclick = event => openMail(email['id']);
      };
    });
  });
}


//Create a function to see the e-mail details
function openMail(id) {
  //Delete previous emails
  document.querySelector('#emails-view').replaceChildren();

  //Create new div for e-mail details
  const emailDetails=document.createElement("div");
  emailDetails.id='email-details';
  document.getElementById("emails-view").appendChild(emailDetails);
  
  //Get the e-mail details
  fetch(`/emails/`+ id)
  .then(response => response.json())
  .then(e => {
      const showMail = document.createElement("div");
      showMail.id='email-display';
      let email_details = ` 
      <div style="padding: 8px"><strong>From:</strong> ${e['sender']} </div>
      <div style="padding: 8px"><strong>To:</strong> ${e['recipients']} </div>
      <div style="padding: 8px"><strong>Subject:</strong> ${e['subject']}</div>
      <div style="padding: 8px"><strong>Timestamp:</strong> ${e['timestamp']}</div>
      <br>
      <div style="border-bottom: solid; width:100%; color: #80808080; padding-top: 12px"></div>
      <div style="padding: 8px">${e['body']}</div>
      <br>
      <button id="reply" role="button">Reply</button>
      `;
      if (e['sender']!=document.querySelector('h2').innerHTML){
        if(e['archived']===false){
          email_details = email_details + `<button id='archive' role='button'>Archive</button>`
        } else {
          email_details = email_details + `<button id='archive' role='button'>Send to inbox</button>`
        }
      }
      showMail.innerHTML = email_details;
      
      document.getElementById("email-details").appendChild(showMail);
      fetch('/emails/' + id, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      });
      document.getElementById('reply').onclick = event => reply(id);    
      document.getElementById('archive').onclick = event => archive(id);
  });
}


function reply(id){
  fetch(`/emails/`+ id)
  .then(response => response.json())
  .then(e => {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = `${e['sender']}`;
    if (e['subject'].startsWith('Re:')){
      document.querySelector('#compose-subject').value = `${e['subject']}`;
    } else {
      document.querySelector('#compose-subject').value = `Re: ${e['subject']}`;
    }
    document.querySelector('#compose-body').value = `On ${e['timestamp']}, ${e['sender']} wrote: ${e['body']} ${'\n'}Reply: ${'\n'}`;

    //Autofocus on compose-body
    let body_text = document.querySelector('#compose-body');
    body_text.focus();
    
    // On sumbit send the email
    document.querySelector('form').onsubmit = function() {
    //POST request to /emails, passing in values for recipients, subject, and body
    const recipients = document.querySelector('#compose-recipients').value 
    const subject = document.querySelector('#compose-subject').value
    const body = document.querySelector('#compose-body').value
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    })
    //Once the email has been sent, load the user’s sent mailbox
    .then(response => load_mailbox('sent'));
  }

  });

}

function archive(id){
  fetch('/emails/' + id)
  .then(response => response.json())
  .then(email => {
      if (email['archived']===true){
        fetch('/emails/' + id, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        }).then(response => load_mailbox('inbox'))
      } else {
        fetch('/emails/' + id, {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        }).then(response => load_mailbox('inbox'))
      }
  });
}