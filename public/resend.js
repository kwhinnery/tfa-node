$(function() {
    // Get handle to verification form
    var actionUrl = $('form').attr('action');
    var sessionId = actionUrl.split('/')[3];

    // Get resend link
    $link = $('#resend');

    // Resend the verification code on click
    $link.on('click', function(e) {
        e.preventDefault();
        $link.prop('disabled', true);

        // resend code for session ID
        $.ajax({
            method: 'POST',
            url: '/sessions/verify/'+sessionId+'/resend'
        }).done(function(data) {
            alert(data.message);
        }).fail(function() {
            alert('There was an error resending your code.');
        }).always(function() {
            $link.prop('disabled', false);
        });
    });
});