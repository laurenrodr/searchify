/*
 * Spotify Authentication
 */

const limit = 10;

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
     hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

var userProfileSource = document.getElementById('user-profile-template').innerHTML,
    userProfileTemplate = Handlebars.compile(userProfileSource),
    userProfilePlaceholder = document.getElementById('user-profile');

var oauthSource = document.getElementById('oauth-template').innerHTML,
    oauthTemplate = Handlebars.compile(oauthSource),
    oauthPlaceholder = document.getElementById('oauth');

var modalSelectSource = document.getElementById('modal-select-template').innerHTML,
    modalSelectTemplate = Handlebars.compile(modalSelectSource),
    modalSelectPlaceholder = document.getElementById('modal-select');

var params = getHashParams();

let access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;

if (error) {
  alert('There was an error during the authentication');
} else {
  if (access_token) {
    // render oauth info
    oauthPlaceholder.innerHTML = oauthTemplate({
      access_token: access_token,
      refresh_token: refresh_token
    });

    $.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
          userProfilePlaceholder.innerHTML = userProfileTemplate(response);
          modalSelectPlaceholder.innerHTML = modalSelectTemplate(response);

          $('#login').hide();
          $('#loggedin').show();
        }
    });
  } else {
      // render initial screen
      $('#login').show();
      $('#loggedin').hide();
  }

  document.getElementById('obtain-new-token').addEventListener('click', function() {
    $.ajax({
      url: '/refresh_token',
      data: {
        'refresh_token': refresh_token
      }
    }).done(function(data) {
      access_token = data.access_token;
      oauthPlaceholder.innerHTML = oauthTemplate({
        access_token: access_token,
        refresh_token: refresh_token
      });
    });
  }, false);
}


function getTopTracks() {


  $.ajax({
    url: 'https://api.spotify.com/v1/me/top/tracks?limit=' + limit + '&time_range=short_term',
    headers: {
      'Authorization': 'Bearer ' + access_token
    },
    success: function(response) {
      $(".recs-btn").show();

      mapOverSongs(response.items);

      document.getElementById("get-top-tracks").disabled = true;
      document.getElementById("dCard").style.display = "none";

    }
  });
}

function mapOverSongs(songs) {

    songs.map( function(song) {
          var list = "<input type='checkbox' name='top-tracks' class='form-check-input' value='" +
                  song.id + "'>" +
                  "<a name='track-names' href='" + song.external_urls.spotify + "'>" +
                  song.name +
                  " by " + song.artists[0].name +
                  " from the album " + song.album.name +
                  "</a><br><br>";
          document.getElementById('show-top-tracks').innerHTML += list;

    });
}

function getRecommendations() {

    var checkboxes = document.getElementsByName('top-tracks');
    var numChecked = document.querySelectorAll('input[type="checkbox"]:checked').length;
    if(numChecked < 1) {
        $(".rec-alert").show();
    }
    else {

            var selected = "";
            for (var i=0, n=checkboxes.length; i<n; i++) {
                if (checkboxes[i].checked) {
                    selected += checkboxes[i].value+",";
                }
            }
            selected = selected.slice(0, -1);
            $.ajax({
                url: 'https://api.spotify.com/v1/recommendations?market=US&seed_tracks=' + selected + '&limit=' + limit,
                headers: {
                'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                    mapOverRecommendations(response.tracks);
                }
            });
    }

}

function mapOverRecommendations(recommendations) {
  $(".show-recs").show();
  recommendations.map(function (song) {
    var list =
        "<tr class='table-light'><td><a target='_blank' href='" + song.external_urls.spotify + "'>" + song.name + " </a></td><td>" + song.artists[0].name + " </td><td>" + song.album.name + "</td></tr>";
    document.getElementById('getrecommendations').innerHTML += list;
  });
}
