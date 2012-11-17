(function($) {

	$.fn.rdbColumn = function() {
		return $(this).rdbFindUp('[data-rdb-column-id]');
	};

	$.fn.rdbColumnId = function() {
		return $(this).rdbColumn().data('rdb-column-id');
	};

	$.fn.rdbGroup = function() {
		return $(this).rdbFindUp('[data-rdb-group-id]');
	};

	$.fn.rdbGroupId = function() {
		return $(this).rdbGroup().data('rdb-group-id');
	};

	/* ====================================================
	** Drag and drop
	*/
	$(document).ready(function() {

		$.fn.rdbInitDAD = function () {
			var el = $(this);
			el.find(".rdb-issue").each(function() {
				var issue = $(this);

				issue.draggable('destroy');

				issue.draggable({
					revert: true,
					cursorAt: { left: Math.floor(issue.width() / 2) },
					containment: '#rdb-board',
					start: function() { $(this).addClass('rdb-issue-dragged'); },
					stop: function() { $(this).removeClass('rdb-issue-dragged'); }
				});
			});

			el.find(".rdb-column").each(function() {
				var column = $(this);
				var coluid = column.rdbColumnId();
				var accept = column.data('rdb-drop-accept');
				if(coluid && accept) {
					column.droppable({
						accept: '[data-rdb-drop-on="' + accept + '"]',
						activeClass: "rdb-column-drop-active",
						hoverClass: "rdb-column-drop-hover",
						drop: function(event, ui) {
							var issue = $(ui.draggable).rdbIssue();
							var issueId = issue.rdbIssueId();
							var groupId = issue.rdbGroupId();

							if(issueId && issue.rdbColumnId() != coluid) {
								issue.appendTo(column);
								issue.remove();
								issue.css({ position: 'static' });

								$.getScript('?update[issue]=' + issueId + '&update[column]=' + coluid + '&update[group]=' + groupId);
							}
						}
					});
				}
			});
		};

		$.fn.rdbDestroyDAD = function () {
			$(this).find(".rdb-issue").draggable('destroy');
		};

		$().rdbInit(function() {
			$(this).rdbInitDAD();
		});

	});

	/* ====================================================
	** Collapse groups
	*/
	$(document).ready(function() {

		$(document).click(function (e) {
			var link  = $(e.target).rdbFindUp('a').first();
			var group = link.rdbGroup();
			if(link.rdbAny() && group.rdbAny() && link.parents().is('.rdb-group-header')) {
				e.preventDefault();
				if(group.hasClass('rdb-collapsed')) {
					group.removeClass('rdb-collapsed');
					group.rdbStorageRemove('collapsed-groups', group.rdbGroupId());
				} else {
					group.addClass('rdb-collapsed');
					group.rdbStorageAdd('collapsed-groups', group.rdbGroupId());
				}
			}
		});

		$('.rdb-group').each(function() {
			var group = $(this);
			if(group.rdbStorageHas('collapsed-groups', group.rdbGroupId())) {
				group.addClass('rdb-collapsed');
			}
		});
	});

})(jQuery);;