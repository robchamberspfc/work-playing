      var images = $.get("https://publishing.develop.onsdigital.co.uk/zebedee/teams" + page + "/",
                         function (data) {
                           $.each(data, function(i, item) {
                             $(var.teams).append(++item.name++);
                           }
                           console.log(teams);
                                 );
                         }
                        );
