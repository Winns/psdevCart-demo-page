$(function() {
	var cart = new psdevCart();

	var cartRender = new (function() {
		var self = this;

		this.el 		= {};
		this.el.$cart 	= $('.g-cart');
		this.el.$output = this.el.$cart.find('ul');
		this.el.$total 	= this.el.$cart.find('.total');

		this.template = function( data ) {
			var p 		= window.products[ data.id ],
				html 	= '';

			html += '<li>';
			html += 	'<div class="name">'+ p.name +'</div>';
			html += 	'<div class="price">$'+ (p.price * data.count) +'</div>';
			html += 	'<div class="count">';
			html += 		'<i class="js-cart-minus fa fa-minus" data-limit="1" data-id="'+ p.id +'"></i>';
			html += 		'<input type="text" class="js-cart-count" value="'+ data.count +'" data-id="'+ p.id +'">';
			html += 		'<i class="js-cart-plus fa fa-plus" data-id="'+ p.id +'"></i>';
			html += 	'</div>';
			html += 	'<div class="remove js-cart-remove fa fa-times" data-id="'+ p.id +'"></div>';
			html += '</li>';

			return html;
		};

		this.render = function( data ) {
			var html = '';
	
			for (var id in data.items) {
				html += self.template( data.items[id] );		
			}

			self.el.$output.html( html );
		};

		this.showTotal = function( data ) {
			var total = 0,
				item;

			for (var key in data.items) {
				item = window.products[ key ];
				total += item.price * data.items[ key ].count
			}

			this.el.$total.html( '$' + total );
		};

		this.run = function( data ) {
			this.render( data );
			this.showTotal( data );
		};
	});

	var styleCartButtons = new (function() {
		var self = this;

		this.$btn = $('.js-cart-add');

		this.run = function( data ) {
			var id, $el;

			this.$btn.each(function() {
				$el = $(this);
				id 	= $el.attr('data-id');

				if (cart.get( id ) !== false)
					$el.addClass( 'active' );
				else
					$el.removeClass( 'active' );
			});
		};
	});

	cart.on( 'render', function( data ) {
		cartRender.run( data );
		styleCartButtons.run( data );
	});

	cart.render();
});