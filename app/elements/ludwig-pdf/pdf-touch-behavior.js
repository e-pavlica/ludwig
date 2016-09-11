if (!window.Ludwig) window.Ludwig = {};

Ludwig.PDFTouchBehavior = {
    properties: {
        /**
         * Percent of page that represents the Next/Last page tap areas,
         * e.g. if set to 0.3 (the default) a taps in the right 30% of the
         * element will call the _nextPage method, 0.2 would be 20%, etc.
         */
        leftRightTapMargin: {
            type: Number,
            value: 0.3
        }
    },

    listeners: {
        tap: '_tapAction'
    },

    /**
     * Delegate a tap event to the correct function
     * @param {Event} event - Tap event
     */
    _tapAction: function(event) {
        let relativePositions = this._relativeTapPosition(event.detail.x, event.detail.y);
        // Right Page Tap
        if (relativePositions.right < this.leftRightTapMargin) {
            this._nextPage();

        // Left Page Tap
        } else if (relativePositions.left < this.leftRightTapMargin) {
            this._previousPage();

        // Center Page Tap
        } else {
            this._toggleUiComponents();
        }
    },

    /**
     * Determine relative position of a tap
     * @param {Number} x - x coordinate
     * @param {Number} y - y coordinate
     * @returns {Object} position relative to top, bottom, left, right
     */
    _relativeTapPosition: function(x, y) {
        let width = window.innerWidth;
        let height = window.innerHeight;
        let right = 1 - (x / width);
        let left = x / width;
        let top = y / height;
        let bottom = 1 - (y / height);
        return {
            top: top,
            bottom: bottom,
            left: left,
            right: right
        };
    }
};
