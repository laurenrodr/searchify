const limit = 10;

var stateKey = 'spotify_auth_state';

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

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var userProfileSource = document.getElementById('user-profile-template').innerHTML,
    userProfileTemplate = Handlebars.compile(userProfileSource),
    userProfilePlaceholder = document.getElementById('user-profile');

    oauthSource = document.getElementById('oauth-template').innerHTML,
    oauthTemplate = Handlebars.compile(oauthSource),
    oauthPlaceholder = document.getElementById('oauth');

var params = getHashParams();

var access_token = params.access_token,
    state = params.state,
    storedState = localStorage.getItem(stateKey);



if (access_token && (state == null || state !== storedState)) {
  alert('There was an error during the authentication');
} else {
  localStorage.removeItem(stateKey);
  if (access_token) {
    $.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
          userProfilePlaceholder.innerHTML = userProfileTemplate(response);

          $('#login').hide();
          $('#loggedin').show();
        }
    });
  } else {
      $('#login').show();
      $('#loggedin').hide();
  }

  document.getElementById('login-button').addEventListener('click', function() {

    var client_id = '3e9119994b24487a83bf048a39832465'; // Your client id
    var redirect_uri = 'http://localhost:8888'; // Your redirect uri

    var state = generateRandomString(16);

    localStorage.setItem(stateKey, state);
    var scope = 'user-read-private user-read-email user-top-read';

    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(client_id);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    url += '&state=' + encodeURIComponent(state);

    window.location = url;
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
