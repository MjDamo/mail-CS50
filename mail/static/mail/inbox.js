document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit compose-form Listener
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}:</h3><br>`;

  // get the email
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // create a div for each email.
    emails.forEach(email => {
      console.log(email);
      const emailElement = document.createElement('div');
      emailElement.innerHTML =
          '<div id="view-body">' +
          '<table class="table">' +
          '<td>From: ' + email.sender + '</td>' +
          '<td>Subject: ' + email.subject + '</td>' +
          '<td>Time: ' + email.timestamp + '</td>' +
          '</table></div>' +
          '<div id="arc-btn"></div>';

      // Archive button
      const arc_btn = document.createElement('button');
      arc_btn.innerHTML = email.archived ? "Unarchived" : "Archive";
      arc_btn.className = email.archived ? 'btn btn-success' : 'btn btn-danger';
      arc_btn.style = "margin-right: 10px"
      arc_btn.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        }).then(r => {load_mailbox('inbox')});
      });
      const userName = document.querySelector(".user-name")
      if (email.sender !== userName.innerHTML){
        emailElement.querySelector("#arc-btn").append(arc_btn);
      }

      emailElement.querySelector('#view-body').addEventListener('click', function() {
        view_email(email.id);
      });
      // list style
      emailElement.className = 'list-group-item';
      // list bg color
      if (email.read === true){
        emailElement.style.backgroundColor = 'white'
      }else{
        emailElement.style.backgroundColor = "#D6D2D2"
      }

      document.querySelector('#emails-view').append(emailElement);
    })
  });

}

function send_email(event) {
  event.preventDefault();
  // email fields
  const compose_recipients = document.querySelector('#compose-recipients').value;
  const compose_subject = document.querySelector('#compose-subject').value;
  const compose_body = document.querySelector('#compose-body').value;


  // Sending data
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: compose_recipients,
        subject: compose_subject,
        body: compose_body
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
    load_mailbox('sent')
  });
}

function view_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    // Show email detail and hide others
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-detail').style.display = 'block';

    // Change read to true
    if (!email.read){
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      });
    }

    // Email details
    document.querySelector('#email-detail').innerHTML =
        '<div class="container p-5 my-5 border">' +
        '<p><strong>From: </strong>' + email.sender + '</p>' +
        '<p><strong>To: </strong>' + email.recipients + '</p>' +
        '<p><strong>Subject: </strong>' + email.subject + '</p>' +
        '<p><strong>Timestamp: </strong>' + email.timestamp + '</p><hr>' +
        '<p>' + email.body + '</p>' +
        '</div>'

    // Reply button
    const rpl_btn = document.createElement('button');
    rpl_btn.innerHTML = "Reply";
    rpl_btn.className = 'btn btn-light';
    rpl_btn.addEventListener('click', function() {
      let new_subject = email.subject;
      if (new_subject.split(' ')[0] !== 'Re:'){
        new_subject = "Re: " + email.subject;
      }
      compose_email();
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = new_subject;
      document.querySelector('#compose-body').value = 'On ' + email.timestamp + " " + email.sender + " wrote: " + email.body + "\n\n";
    });

    document.querySelector('#email-detail').append(rpl_btn);
  });
}
