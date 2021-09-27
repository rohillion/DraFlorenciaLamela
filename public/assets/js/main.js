/*
	Paradigm Shift by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {

	var $window = $(window),
		$body = $('body'),
		$contact = $('#contact');

	// Breakpoints.
	breakpoints({
		default: ['1681px', null],
		xlarge: ['1281px', '1680px'],
		large: ['981px', '1280px'],
		medium: ['737px', '980px'],
		small: ['481px', '736px'],
		xsmall: ['361px', '480px'],
		xxsmall: [null, '360px']
	});

	// Play initial animations on page load.
	$window.on('load', function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);
	});

	// Hack: Enable IE workarounds.
	if (browser.name == 'ie')
		$body.addClass('is-ie');

	// Mobile?
	if (browser.mobile)
		$body.addClass('is-mobile');

	// Scrolly.
	$('.scrolly')
		.scrolly({
			offset: 100
		});

	// Polyfill: Object fit.
	if (!browser.canUse('object-fit')) {

		$('.image[data-position]').each(function () {

			var $this = $(this),
				$img = $this.children('img');

			// Apply img as background.
			$this
				.css('background-image', 'url("' + $img.attr('src') + '")')
				.css('background-position', $this.data('position'))
				.css('background-size', 'cover')
				.css('background-repeat', 'no-repeat');

			// Hide img.
			$img
				.css('opacity', '0');

		});

		$('.gallery > a').each(function () {

			var $this = $(this),
				$img = $this.children('img');

			// Apply img as background.
			$this
				.css('background-image', 'url("' + $img.attr('src') + '")')
				.css('background-position', 'center')
				.css('background-size', 'cover')
				.css('background-repeat', 'no-repeat');

			// Hide img.
			$img
				.css('opacity', '0');

		});

	}

	// Gallery.
	$('.gallery')
		.on('click', 'a', function (event) {

			var $a = $(this),
				$gallery = $a.parents('.gallery'),
				$modal = $gallery.children('.modal'),
				$modalImg = $modal.find('img'),
				href = $a.attr('href');

			// Not an image? Bail.
			if (!href.match(/\.(jpg|gif|png|mp4)$/))
				return;

			// Prevent default.
			event.preventDefault();
			event.stopPropagation();

			// Locked? Bail.
			if ($modal[0]._locked)
				return;

			// Lock.
			$modal[0]._locked = true;

			// Set src.
			$modalImg.attr('src', href);

			// Set visible.
			$modal.addClass('visible');

			// Focus.
			$modal.focus();

			// Delay.
			setTimeout(function () {

				// Unlock.
				$modal[0]._locked = false;

			}, 600);

		})
		.on('click', '.modal', function (event) {

			var $modal = $(this),
				$modalImg = $modal.find('img');

			// Locked? Bail.
			if ($modal[0]._locked)
				return;

			// Already hidden? Bail.
			if (!$modal.hasClass('visible'))
				return;

			// Stop propagation.
			event.stopPropagation();

			// Lock.
			$modal[0]._locked = true;

			// Clear visible, loaded.
			$modal
				.removeClass('loaded')

			// Delay.
			setTimeout(function () {

				$modal
					.removeClass('visible')

				setTimeout(function () {

					// Clear src.
					$modalImg.attr('src', '');

					// Unlock.
					$modal[0]._locked = false;

					// Focus.
					$body.focus();

				}, 475);

			}, 125);

		})
		.on('keypress', '.modal', function (event) {

			var $modal = $(this);

			// Escape? Hide modal.
			if (event.keyCode == 27)
				$modal.trigger('click');

		})
		.on('mouseup mousedown mousemove', '.modal', function (event) {

			// Stop propagation.
			event.stopPropagation();

		})
		.prepend('<div class="modal" tabIndex="-1"><div class="inner"><img src="" /></div></div>')
		.find('img')
		.on('load', function (event) {

			var $modalImg = $(this),
				$modal = $modalImg.parents('.modal');

			setTimeout(function () {

				// No longer visible? Bail.
				if (!$modal.hasClass('visible'))
					return;

				// Set loaded.
				$modal.addClass('loaded');

			}, 275);

		});

	$contact.on("submit", function (e) {
		e.preventDefault();

		grecaptcha.ready(function () {
			grecaptcha.execute('6Ldm85AcAAAAAKpRPleCXsJzQpX_jOv0tAk4TJQu', { action: 'submit' }).then(function (token) {
				$.ajax({
					url: 'https://us-central1-draflorencialamela.cloudfunctions.net/contact',
					// url: 'http://localhost:5001/draflorencialamela/us-central1/contact',
					type: 'POST',
					data: JSON.stringify(getFormData($contact, [{ name: "reCaptchaToken", value: token }])),
					contentType: 'application/json',
					success: function (got) {
						$contact.find("input[type=text], input[type=email], textarea").val("");
						return alert("Gracias por tu mensaje! Recibiras una respuesta en breve. Por favor, reviza tu bandeja de correo no deseado si la respuesta tarda en llegar.");
					},
					error: function () {
						return alert("Ha habido un problema enviando el mensaje. Por favor, intentelo de nuevo. Si el problema persiste, llame al número teléfono disponible en esta misma sección.");
					}
				});
			});
		});
	});

	function getFormData($form, additionalValues) {
		var serialized_array = $form.serializeArray();
		var indexed_array = {};


		const unindexed_array = serialized_array.concat(additionalValues);

		$.map(unindexed_array, function (n, i) {
			indexed_array[n['name']] = n['value'];
		});

		return indexed_array;
	}

})(jQuery);