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
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // get the email
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // create a div for each email.
    emails.forEach(email => {
      console.log(email);
      const emailElement = document.createElement('div');
      emailElement.innerHTML =
          '<h6>From: ' + email.sender + '</h6>' +
          '<h4>Subject: ' + email.subject + '</h4>' +
          '<h6>Time: ' + email.timestamp + '</h6>';
      emailElement.addEventListener('click', function() {
          // console.log('This element has been clicked!')
        view_email(email.id);
      });
      // list style
      emailElement.className = 'list-group-item';
      // list bg color
      if (email.read === true){
        emailElement.style.backgroundColor = 'white'
      }else{
        emailElement.style.backgroundColor = "gray"
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
      '<ul class="list-group">' +
        '<li class="list-group-item"><strong>From: </strong>' + email.sender + '</li>' +
        '<li class="list-group-item"><strong>To: </strong>' + email.recipients + '</li>' +
        '<li class="list-group-item"><strong>Subject: </strong>' + email.subject + '</li>' +
        '<li class="list-group-item"><strong>Timestamp: </strong>' + email.timestamp + '</li>' +
        '<li class="list-group-item">' + email.body + '</li>' +
        '</ul>'
    // Archive button
    const arc_btn = document.createElement('button');
    arc_btn.innerHTML = email.archived ? "Unarchived" : "Archive";
    arc_btn.className = email.archived ? 'btn btn-success' : 'btn btn-danger';
    arc_btn.addEventListener('click', function() {
      console.log('This element has been clicked!')
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: !email.archived
        })
      }).then(r => {load_mailbox('archive')});
    });
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

    document.querySelector('#email-detail').append(arc_btn);
    document.querySelector('#email-detail').append(rpl_btn);

    // '<h6>From: ' + email.sender + '</h6>' +
    // '<h4>Subject: ' + email.subject + '</h4>' +
    // '<h6>Time: ' + email.timestamp + '</h6>';
  });
}
