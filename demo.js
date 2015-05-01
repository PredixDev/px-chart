setTimeout(function(){
    function AppViewModel() {
        this.name = ko.observable("Bert");
        this.queries = JSON.stringify([{
            "sample_size": 14368,
            "results": [
                {
                    "name": "Series C",
                    "values": [
                        [1209600000000, 50.71],
                        [1209686400000, 51.85],
                        [1209945600000, 52.39],
                        [1210032000000, 53.67],
                        [1210118400000, 54.08],
                        [1210204800000, 52.44],
                        [1210291200000, 52.21],
                        [1210550400000, 52.88],
                        [1212364800000, 29.59],
                        [1212451200000, 29.48],
                        [1212537600000, 39.46]
                    ]
                }
            ]
        }]);
    }

    // Activates knockout.js
    ko.applyBindings(new AppViewModel());
}, 100);
