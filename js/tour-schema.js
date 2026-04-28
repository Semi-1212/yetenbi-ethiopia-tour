document.addEventListener('DOMContentLoaded', function () {
    var baseUrl = window.location.origin || 'https://www.yetenbitourethiopia.com';

    function textFromElement(root, selectors) {
        for (var i = 0; i < selectors.length; i += 1) {
            var node = root.querySelector(selectors[i]);
            if (node && node.textContent) {
                var value = node.textContent.replace(/\s+/g, ' ').trim();
                if (value) {
                    return value;
                }
            }
        }
        return '';
    }

    function imageFromCard(card) {
        var imageSelectors = [
            'img',
            '.tour-media',
            '.exp-media',
            '.hike-image',
            '.card-image',
            '.tour-card-image'
        ];

        for (var i = 0; i < imageSelectors.length; i += 1) {
            var node = card.querySelector(imageSelectors[i]);
            if (!node) {
                continue;
            }

            if (node.tagName === 'IMG') {
                var src = node.getAttribute('src') || '';
                if (src) {
                    return new URL(src, window.location.href).toString();
                }
            }

            var inlineStyle = node.getAttribute('style') || '';
            var bgMatch = inlineStyle.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
            if (bgMatch && bgMatch[2]) {
                return new URL(bgMatch[2], window.location.href).toString();
            }
        }

        return '';
    }

    function extractPrice(rawPrice) {
        if (!rawPrice) {
            return null;
        }

        var normalized = rawPrice.replace(/,/g, '');
        var match = normalized.match(/\$?\s*(\d+(?:\.\d+)?)/);
        if (!match) {
            return null;
        }

        return {
            value: match[1],
            currency: 'USD'
        };
    }

    function locationFromCard(card, fallbackDescription) {
        var locationText = '';
        var metaSpans = card.querySelectorAll('.tour-meta span, .exp-meta span, .hike-meta span');
        for (var i = 0; i < metaSpans.length; i += 1) {
            var icon = metaSpans[i].querySelector('.fa-map-marker-alt');
            if (icon) {
                locationText = metaSpans[i].textContent.replace(/\s+/g, ' ').trim();
                break;
            }
        }

        if (!locationText) {
            var fallbackMatch = (fallbackDescription || '').match(/\b(?:in|across|through|around)\s+([A-Z][A-Za-z&\-\s]{2,40})/);
            if (fallbackMatch) {
                locationText = fallbackMatch[1].trim();
            }
        }

        return locationText;
    }

    function cardToTrip(card) {
        var name = textFromElement(card, ['h3', 'h2']);
        if (!name) {
            return null;
        }

        var description = textFromElement(card, ['p']);
        var duration = textFromElement(card, ['.tour-tag', '.exp-tag', '.hike-meta span:nth-child(2)']);
        var urlNode = card.querySelector('a[href]');
        var url = urlNode ? new URL(urlNode.getAttribute('href'), window.location.href).toString() : window.location.href;
        var image = imageFromCard(card);
        var rawPrice = textFromElement(card, ['.price-badge', '.price', '.tour-price']);
        var parsedPrice = extractPrice(rawPrice);
        var locationText = locationFromCard(card, description);

        var trip = {
            '@type': 'TouristTrip',
            name: name,
            description: description || ('Tour package by Yetenbi Ethiopia Tours: ' + name),
            url: url
        };

        if (duration) {
            trip.itinerary = duration;
        }

        if (locationText) {
            trip.touristType = locationText;
        }

        if (image) {
            trip.image = image;
        }

        if (parsedPrice) {
            trip.offers = {
                '@type': 'Offer',
                price: parsedPrice.value,
                priceCurrency: parsedPrice.currency,
                availability: 'https://schema.org/InStock',
                url: url
            };
        }

        return trip;
    }

    var cardSelectors = [
        '.tour-card',
        '.hike-card',
        '.exp-card',
        '.tour-item',
        '.package-card',
        '.activity-card'
    ];

    var cards = [];
    cardSelectors.forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (card) {
            if (cards.indexOf(card) === -1) {
                cards.push(card);
            }
        });
    });

    var trips = cards.map(cardToTrip).filter(function (trip) {
        return !!trip;
    });

    if (!trips.length) {
        return;
    }

    var schemaData = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'TourOperator',
                name: 'Yetenbi Ethiopia Tours',
                url: baseUrl,
                telephone: '+251913271706'
            }
        ].concat(trips)
    };

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-generated-tour-schema', 'true');
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);
});
