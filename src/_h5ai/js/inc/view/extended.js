
module.define('view/extended', [jQuery, 'core/settings', 'core/resource', 'core/format', 'core/event', 'core/entry'], function ($, allsettings, resource, format, event, entry) {

	var defaults = {
			modes: ['details', 'icons'],
			setParentFolderLabels: false
		},

		settings = _.extend({}, defaults, allsettings.view),

		template = '<li class="entry">' +
						'<a>' +
							'<span class="icon small"><img /></span>' +
							'<span class="icon big"><img /></span>' +
							'<span class="label" />' +
							'<span class="date" />' +
							'<span class="size" />' +
						'</a>' +
					'</li>',
		hintTemplate = '<span class="hint"></span>',
		listTemplate = '<ul>' +
							'<li class="header">' +
								'<a class="icon"></a>' +
								'<a class="label" href="#"><span class="l10n-name"></span></a>' +
								'<a class="date" href="#"><span class="l10n-lastModified"></span></a>' +
								'<a class="size" href="#"><span class="l10n-size"></span></a>' +
							'</li>' +
						'</ul>',
		emptyTemplate = '<div class="empty l10n-empty">empty</div>',

		// updates this single entry
		update = function (entry) {

			if (entry.$extended && entry.status && entry.$extended.data('status') === entry.status) {
				return entry.$extended;
			}

			var $html = $(template),
				$a = $html.find('a'),
				$imgSmall = $html.find('.icon.small img'),
				$imgBig = $html.find('.icon.big img'),
				$label = $html.find('.label'),
				$date = $html.find('.date'),
				$size = $html.find('.size');
				// escapedHref = entry.absHref.replace(/'/g, "%27").replace(/"/g, "%22");

			$html
				.addClass(entry.isFolder() ? 'folder' : 'file')
				.data('entry', entry)
				.data('status', entry.status);

			$a.attr('href', entry.absHref);
			$imgSmall.attr('src', resource.icon(entry.type)).attr('alt', entry.type);
			$imgBig.attr('src', resource.icon(entry.type, true)).attr('alt', entry.type);
			$label.text(entry.label);
			$date.data('time', entry.time).text(format.formatDate(entry.time));
			$size.data('bytes', entry.size).text(format.formatSize(entry.size));

			if (entry.isFolder() && _.isNumber(entry.status)) {
				if (entry.status === 200) {
					$html.addClass('page');
					$imgSmall.attr('src', resource.icon('folder-page'));
					$imgBig.attr('src', resource.icon('folder-page', true));
				} else {
					$html.addClass('error');
					$label.append($(hintTemplate).text(' ' + entry.status + ' '));
				}
			}

			if (entry.isParentFolder) {
				$imgSmall.attr('src', resource.icon('folder-parent'));
				$imgBig.attr('src', resource.icon('folder-parent', true));
				if (!settings.setParentFolderLabels) {
					$label.addClass('l10n-parentDirectory');
				}
				$html.addClass('folder-parent');
			}

			if (entry.$extended) {
				entry.$extended.replaceWith($html);
			}
			entry.$extended = $html;

			return $html;
		},

		onMouseenter = function () {

			var entry = $(this).closest('.entry').data('entry');
			event.pub('entry.mouseenter', entry);
		},

		onMouseleave = function () {

			var entry = $(this).closest('.entry').data('entry');
			event.pub('entry.mouseleave', entry);
		},

		// creates the view for entry content
		init = function (entry) {

			var $extended = $('#extended'),
				$ul = $(listTemplate);

			if (entry.parent) {
				$ul.append(update(entry.parent));
			}

			_.each(entry.content, function (e) {

				$ul.append(update(e));

				e.fetchStatus(function (e) {

					update(e);
				});
			});

			$extended.append($ul);

			if (entry.isEmpty()) {
				$extended.append($(emptyTemplate));
			}

			$extended
				.on('mouseenter', '.entry a', onMouseenter)
				.on('mouseleave', '.entry a', onMouseleave);
		};

	init(entry);
});
