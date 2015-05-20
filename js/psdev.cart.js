'use strict';

var psdevCart = function( cfg ) {
    var self = this;

    this.cfg = $.extend({
        elAdd           : '.js-cart-add',
        elRemove        : '.js-cart-remove',
        elClear         : '.js-cart-clear',
        elPlus          : '.js-cart-plus',
        elMinus         : '.js-cart-minus',
        elCountInput    : '.js-cart-count',

        syncInterval    : 1500,
        constructor     : null
    }, cfg || {});

    this.updateTime = null;

    this.msg = {
        ERR_DATAID: function( source ) {
            return 'psdevCart ("'+ source +'") - Element dont have data-id attribute';
        }
    };

    // On
    this.onPool = [];

    this.on = function( method, f ) {
        this.onPool.push({
            method: method,
            f: f
        });
    };

    this.onTrigger = function( method, data ) {
        var o, data = data || null;

        for (var i=0; i < this.onPool.length; i++) {
            o = this.onPool[i];
            if (o.method === method) o.f( data );
        }
    };
    // end On

    this.add = function( data ) {
        var items = this.load().items;

        if ( items.hasOwnProperty( data.id ) ) return;

        items[ data.id ] = data;

        this.save( items );
        this.onTrigger( 'add', data );
    };

    this.remove = function( id ) {
        var items = this.load().items;

        if ( !items.hasOwnProperty( id ) ) return;

        delete items[ id ];

        this.save( items );
        this.onTrigger( 'remove', id );
    };

    this.clear = function() {
        this.save({});
        this.onTrigger( 'clear' );
    };

    this.update = function( id, data ) {
        var items = this.load().items;

        if (items.hasOwnProperty( id )) {
            items[ id ] = $.extend( items[ id ], data );
            this.save( items );
        } else {
            this.add({ id: id, count: 1 });
        }
    };

    this.get = function( id ) {
        var items = this.load().items;

        if (items.hasOwnProperty( id ))
            return items[ id ]
        else
            return false;
    };

    this.render = function() {
        this.onTrigger( 'render', this.load() );
    };

    // Stotage methods
    this.fixStorage = function() {
        var data = localStorage.getItem( 'cart' ),
            cart = JSON.stringify({
                updateTime: new Date().getTime(),
                items: {},
                count: 0
            });

        try {
            if (data === null) {
                localStorage.setItem( 'cart', cart );
            } else {
                data = JSON.parse( data );

                if ((!data.hasOwnProperty( 'updateTime' )) || (!data.hasOwnProperty( 'items' )) || (!data.hasOwnProperty( 'count' ))) {
                    localStorage.setItem( 'cart', cart );
                }
            }
        } catch(e) {
            localStorage.setItem( 'cart', cart );
        }
    };

    this.load = function() {
        this.fixStorage();
        return JSON.parse( localStorage.getItem( 'cart' ) );
    };

    this.save = function( items ) {
        var o = {
            updateTime: new Date().getTime(),
            items: items,
            count: (function() {
                var n = 0;

                for (var key in items) {
                    n += items[ key ].count >> 0;
                }

                return n;
            })()
        };
        this.updateTime = o.updateTime;

        localStorage.setItem( 'cart', JSON.stringify( o ) );

        this.onTrigger( 'save', items );
        this.onTrigger( 'render', o );
    };
    // END Stotage methods

    // Init
    this.init = function() {
        var data = this.load();

        if (this.cfg.constructor !== null)
            this.cfg.constructor( this, data );

        this.updateTime = data.updateTime;
        this.onTrigger( 'render', data );

        // Start localstorage auto sync
        setInterval(function() {
            var data = self.load();

            if (data.updateTime != self.updateTime) {
                self.updateTime = data.updateTime;
                self.onTrigger( 'render', self.load() );
            }
        }, self.cfg.syncInterval );

        // On Add click
        $( document ).on( 'click', this.cfg.elAdd, function() {
            var id      = $( this ).attr( 'data-id' ),
                oldData = self.get( id );

            if (id === undefined) 
                throw new Error( self.msg['ERR_DATAID']('On Add click') );

            if (!oldData) self.add({ id: id, count: 1 });
        });

        // On Remove click
        $( document ).on( 'click', this.cfg.elRemove, function() {
            var id = $( this ).attr( 'data-id' );

            if (id === undefined) 
                throw new Error( self.msg['ERR_DATAID']('On Remove click') );

            self.remove( id );
        });

        // On Plus click
        $( document ).on( 'click', this.cfg.elPlus, function() {
            var id      = $( this ).attr( 'data-id' ),
                oldData = self.get( id );

            if (id === undefined) 
                throw new Error( self.msg['ERR_DATAID']('On Plus click') );

            if (!oldData)
                self.add({ id: id, count: 1 });
            else
                self.update( id, {count: oldData.count + 1} );
        });

        // On Minus click
        $( document ).on( 'click', this.cfg.elMinus, function() {
            var id      = $( this ).attr( 'data-id' ),
                oldData = self.get( id ),
                limit   = $( this ).attr( 'data-limit' );

            if (id === undefined) 
                throw new Error( self.msg['ERR_DATAID']('On Minus click') );

            if (limit === undefined)
                limit = 0;
            else
                limit = limit >> 0;

            if (oldData && oldData.count > limit) {
                if ((oldData.count - 1) <= 0)
                    self.remove( id );
                else
                    self.update( id, {count: oldData.count - 1} );
            }
        });

        // On Count Input change
        $( document ).on( 'change', this.cfg.elCountInput, function() {
            var id  = $( this ).attr( 'data-id' ),
                val = $( this ).val() >> 0;

            if (id === undefined) 
                throw new Error( self.msg['ERR_DATAID']('On Count Input change') );

            if ((val <= 0) || (isNaN(val))) val = 1;

            self.update( id, {count: val} );
        });

        // On Clear click
        $( document ).on( 'click', this.cfg.elClear, this.clear.bind(this) );
    }

    this.init();
};
