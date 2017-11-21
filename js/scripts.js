
// ----------------- //
//
// Chat interact JS
//
// ----------------- //
// Requirements:
// - jQuery
// - Typed.js

$(document).ready(function() {

  // init
  init( $('.chat-interact') );
  chatInteract( $('.chat-interact') );

});


function init($target) {
  loader = '<div class="bubble__loader"><img src="images/spinner-new.svg" alt="" style="height: 1rem;" /></div>';
  $target.find('.bubble-wrap').each(function(i) {
    // make bubbles referenceable
    $(this).attr('id', 'bubble' + (i+1));
    // add loader for non-user bubbles
    if(!$(this).hasClass('bubble-wrap--right')) {
      $(this).find('.bubble').prepend(loader);
    }
  });
}


function chatInteract($target) {

  // Init
  bubbleRun( $target.find('.bubble-wrap#bubble1') );

  // Continue button
  $target.find('[data-action]').on('click touchstart', function (e) {
    e.preventDefault();

    action = $(this).attr('data-action');

    if(action == 'continue') {
      if ($(this).closest('.bubble-wrap.isLoaded').nextAll().length > 0) {
        $next = $(this).closest('.bubble-wrap');
        $(this).closest('.bubble-wrap').nextAll().removeClass('isLoaded');
        setTimeout(function() { bubbleRun($next) }, 500);
      } else {
        bubbleRun($(this).closest('.bubble-wrap'));
      }
    } else if($('#' + action).length == 1) {
      bubbleRun($('#' + action));
    // error cases
    } else if($('#' + action).length > 1) {
      console.log("Action error: more than one instance found.");
    } else if($('#' + action).length == 0) {
      console.log("Action error: no instance found.");
    }
  });


  // Continue key combination (Shift + Enter)
  $target.find('.bubble').find('textarea, input').on('keypress keydown', function(e) {
    if(e.keyCode == 13 && e.shiftKey == true) {
      e.preventDefault();
      bubbleRun($(this).closest('.bubble-wrap'));
    }
  });
  // Form submission handling
  $target.find('form').on('submit', function(e) {
    e.preventDefault();
    postContactForm($(this));
  });

  
  // // Dialog close button
  // $target.find('[data-action="dialog-close"]').on('click touchstart', function (e) {
  //   closeContactForm();
  // });
  // // Dialog close key (Esc)
  // $(document).on('keydown', function(e) {
  //   if(e.keyCode == 27) { closeContactForm() }
  // });

}

// // open Contact From
// function openContactForm() {
//   $('body').addClass('dialogIsActive');
//   setTimeout(function() {
//     bubbleRun( $target.find('.bubble-wrap#bubble1') );
//   }, 500);
// }

// // close Contact Form
// function closeContactForm() {
//   $('.bubble-wrap').removeClass('isLoaded');
//   $('form.conversation').removeClass('isSending');
//   $('body').removeClass('dialogIsActive');
// }

// 'Run' Bubble
function bubbleRun($obj, stophere, nextTarget) {
  nextTimeout = 0;
  nextTarget = (nextTarget) ? nextTarget : null;
  if(nextTarget === null && $(this).attr('data-next')) {
    nextTarget = $(this).attr('data-next');
  }
  $form = $obj.closest('form');

  if(!$obj.hasClass('isLoaded')) {
    $obj.addClass('isLoaded');

    // TODO: jQuery 'pause' run instead of setTimeout?

    setTimeout(function() {
      $obj.find('.typed-target').typed({
        stringsElement: $obj.find('.typed-content'),
        typeSpeed: 3,
        callback: function() {
          $obj.find('.typed-cursor').addClass('isHidden');
        },
      });
    }, 600);

    if($form[0]) {
      $form.scrollTop($form[0].scrollHeight);
    }
    $obj.find('textarea, input').first().focus();
    nextTimeout = 2000;
  }

  if($obj.attr('data-autoplay') == 'false') {
    stophere = true;
  }

  if(stophere !== true) {
    $next = $obj.next();
    if(!$next.hasClass('bubble-wrap--right')) {
      setTimeout( function() { bubbleRun($next); }, nextTimeout);
    } else {
      setTimeout( function() { bubbleRun($next, true); }, nextTimeout);
    }
  }
}

// post Contact Form
function postContactForm($form) {
  if($form) {
    // Variables
    url = $form.attr('action');
    form_data = $form.serialize();
    $response_div = $form.find('#bubble_formresponse');
    $success_div = $form.find('#bubble_success');

    // Set states
    $form.addClass('isSending');
    $form.find('.field').removeClass('hasError');
    $response_div.find('.bubble__content').html('');
    bubbleRun($form.find('[type="submit"]').closest('.bubble-wrap'), true);

    console.log('submitting form...');

    // Make Ajax request
    $.post(url, form_data, function(data) {

      console.log('response! success = ' + data['success']);

      if(data['success'] == false) {

        console.log(data);

        $form.removeClass('isSending');

        error_msg = '';
        if(data['code'] == 400) {
          error_msg = 'A problem occurred... Try again?';
        }

        $.each(data['errors'], function(i, item) {
          $form.find('[name="' + i + '"]').addClass('hasError');
          error_msg += item[0];
        });
        $response_div.find('.bubble__content').html(error_msg);
        $response_div.addClass('isLoaded');

      } else if (data['success'] === true) {

        $form.find('#bubble_formsending, #bubble_formresponse').removeClass('isLoaded');
        $form.removeClass('isSending').addClass('isSuccess');
        bubbleRun($form.find('#bubble_success'));

      }
    });
  }
}