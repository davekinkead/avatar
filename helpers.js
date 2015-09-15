// Get the account service to use for the user's avatar
// Priority: Twitter > Facebook > Google > GitHub > Instagram > Linkedin
getService = function (user) {
  var services = user && user.services || {};
  var customProp = user && Avatar.options.customImageProperty;
  if (customProp && getDescendantProp(user, customProp)) { return 'custom'; }
  var service = _.find([['twitter', 'profile_image_url_https'], ['facebook', 'id'], ['google', 'picture'], ['github', 'username'], ['instagram', 'profile_picture'], ['linkedin', 'pictureUrl']], function(s) { return !!services[s[0]] && s[1].length && !!services[s[0]][s[1]]; });
  if(!service)
    return 'none';
  else
    return service[0];
};

getGravatarUrl = function (user, defaultUrl) {
  var gravatarDefault;
  var validGravatars = ['404', 'mm', 'identicon', 'monsterid', 'wavatar', 'retro', 'blank'];

  // Initials are shown when Gravatar returns 404.
  if (Avatar.options.fallbackType !== 'initials') {
    var valid = _.contains(validGravatars, Avatar.options.gravatarDefault);
    gravatarDefault = valid ? Avatar.options.gravatarDefault : defaultUrl;
  }
  else {
    gravatarDefault = '404';
  }

  var options = {
    // NOTE: Gravatar's default option requires a publicly accessible URL,
    // so it won't work when your app is running on localhost and you're
    // using an image with either the standard default image URL or a custom
    // defaultImageUrl that is a relative path (e.g. 'images/defaultAvatar.png').
    default: gravatarDefault,
    size: 200, // use 200x200 like twitter and facebook above (might be useful later)
    secure: true
  };

  var emailOrHash = getEmailOrHash(user);
  return Gravatar.imageUrl(emailOrHash, options);
};

// Get the user's email address or (if the emailHashProperty is defined) hash
getEmailOrHash = function (user) {
  var emailOrHash;
  if (user && Avatar.options.emailHashProperty && !!getDescendantProp(user, Avatar.options.emailHashProperty)) {
    emailOrHash = getDescendantProp(user, Avatar.options.emailHashProperty);
  }
  else if (user && user.emails) {
    var emails = _.pluck(user.emails, 'address');
    emailOrHash = emails[0] || '00000000000000000000000000000000';
  }
  else {
    // If all else fails, return 32 zeros (trash hash, hehe) so that Gravatar
    // has something to build a URL with at least.
    emailOrHash = '00000000000000000000000000000000';
  }
  return emailOrHash;
};

// Returns the size class to use for an avatar
sizeClass = function(context) {
  // Defaults are 'large', 'small', 'extra-small', but user can add new ones
  return Avatar.options.imageSizes[context.size] ? Avatar.getCssClassPrefix() + '-' + context.size : '';
}

// Returns the shape class for an avatar
shapeClass = function (context) {
  var valid = ['rounded', 'circle'];
  return _.contains(valid, context.shape) ? Avatar.getCssClassPrefix() + '-' + context.shape : '';
}

// Returns the custom class(es) for an avatar
customClasses = function (context) {
  return context.class ? context.class : '';
}

// Returns the initials text for an avatar
initialsText = function(user, context) {
  return context.initials || Avatar.getInitials(user);
}

// Creates the dynamically generated CSS file
//
// CSS is dynamically generated so that we can have both a custom class prefix and also allow for custom sizes
createCSS = function () {

  // We only need to do this on the server

  if (!Meteor.isServer)
    return;

  // The base CSS styles

  var p = '.' + Avatar.getCssClassPrefix();
  var a = p + ' ';

  var css = '';

  // CSS for each of the defined sizes

  for (sizeName in Avatar.options.imageSizes) {

    var size = Avatar.options.imageSizes[sizeName];

    css = '';
  }

  // In order to allow for custom sizes and a custom prefix we need to be able to create a style sheet
  // on the fly. To do this cleanly we use the meteor-hacks:inject package to inject the styles directly
  // into the HTML code before it's sent to the client.

  Inject.rawHead('avatar-styles', '<style>' + css + '</style>');
}
