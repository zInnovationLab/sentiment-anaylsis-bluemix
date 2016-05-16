/*
 * Licensed Materials - Property of IBM
 * "Restricted Materials of IBM"
 *
 * (c) Copyright IBM Corp. 2000, 2016 All Rights Reserved
 *
 */

(function (document) {
    'use strict';

    var searchBox = document.querySelector('#search');
    var newsBlock = document.querySelector('#newsTableBlock');
    var stop = document.querySelector('#stop');

    searchBox.addEventListener('search', function (e) {
        newsBlock.hidden = false;
        newsBlock.search(e.detail.term);
    });

    stop.addEventListener('click', function () {
        console.log('should stop streaming...')
        newsBlock.stop();
    })
})(document);

