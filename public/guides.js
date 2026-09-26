document.querySelector('#contact-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const form=event.currentTarget;
  if(!form.reportValidity()) return;
  const data=new FormData(form);
  const body=`Hello (Ad)mission Possible,\n\n${data.get('message')}\n\n${data.get('name')}`;
  document.querySelector('#contact-copy').value=body;
  document.querySelector('#contact-email').href=`mailto:admissionpossible.official@gmail.com?subject=${encodeURIComponent('Question for (Ad)mission Possible')}&body=${encodeURIComponent(body)}`;
  document.querySelector('#contact-result').hidden=false;
  document.querySelector('#contact-email').focus();
});
