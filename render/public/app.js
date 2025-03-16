var app = angular.module('contracts', ["ngRoute"]);

const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

const triggerUploadBox = inputId=>{
    if($("#"+inputId) .length)
    {
        $("#"+inputId)[0] . click()
    }
}

const UserMan = class {
  user = {}
  updateUser(user)
  {
    localStorage.setItem('user',JSON.stringify(user))
    return this.retrieveUser()
  }
  retrieveUser()
  {
    const user = localStorage.getItem('user')
    this.user = user ? JSON.parse(user) : null
    return this.user
  }
}
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
      templateUrl : "page/app"
    })
    .when('/page/:pageName', {
        // Dynamically load the template based on the pageName
        templateUrl: function(params) {
            return 'page/' + params.pageName ;
        }
    })
  });

app.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});
app.controller('contractsApp', function($scope,$location, $sce) {
  $scope.appName = 'contracts'
  console.info('contracts is ready...')
  window.$scope     = $scope;
  window.$location  = $location;
  $scope.userMan    = new UserMan()
  $scope.user       = $scope.userMan.retrieveUser()
  $scope.currentpath = ()=>{
    return $location.$$path
  }
  if(!$scope.user && $scope.currentpath() != '/page/login')
  {
    console.info($scope.currentpath())
    document.location.href = '#!/page/login';
  }
  $scope.currenturl = ()=>{
    return $location.$$protocol + "://" + $location.$$host + ":" + $location.$$port
  }
  app.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        "http://"+$scope.currenturl+'/**',
        "https://"+$scope.currenturl+'/**'
    ]);
});
  $scope.ajax = (path,method,data,cb=data=>console.info('ajax response => ',data))=>{
    method= method ?? 'GET'
    const req = new XMLHttpRequest()
    
    const form = new FormData()
    Object.keys(data).map(
        key=>{
            form.append(key,data[key])
        }
    )
    req.onload = e=>{
        const response = req.response
        if( cb && ((typeof cb) == 'function') )
        {
            cb(response)
        }
    }
    req.open(method,path)

    if (method.toUpperCase() === 'POST') {
      req.setRequestHeader('X-CSRF-TOKEN', csrfToken); // set CSRF token header
    }
    req.send(form)
  }

  $scope.hex_to_ascii = (str1)=> {
    // Convert the input hexadecimal string to a regular string
    var hex = str1.toString();
    // Initialize an empty string to store the resulting ASCII characters
    var str = '';
    // Iterate through the hexadecimal string, processing two characters at a time
    for (var n = 0; n < hex.length; n += 2) {
        // Extract two characters from the hexadecimal string and convert them to their ASCII equivalent
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    // Return the resulting ASCII string
    return str;
  }
  $scope.login = (event)=>{
    event.preventDefault()
    const email = event.target.email.value
    const password = event.target.password.value
    $scope.ajax('/login','POST',{email,password},(res)=>{
      if(res && res.data)
      {
        const user = JSON.parse(res)
        $scope.userMan.updateUser(user)
        $scope.user = $scope.userMan.retrieveUser()
        document.location.href = '#!/page/home';
      }
      else
      {
        $scope.loginErr = res
      }
      console.info(res)
    })
  }
  $scope.parse_asn = (buffer)=> {
    let index = 0;
  
    function readByte() {
      return buffer[index++];
    }
  
    function readLength() {
      let length = readByte();
      if (length & 0x80) {
        const numBytes = length & 0x7F;
        length = 0;
        for (let i = 0; i < numBytes; i++) {
          length = (length << 8) | readByte();
        }
      }
      return length;
    }
  
    function readValue(length) {
      const value = buffer.slice(index, index + length);
      index += length;
      return value;
    }
  
    function parse() {
      const tag = readByte();
      const length = readLength();
      const value = readValue(length);
  
      // Handle sequences (constructed types)
      if ((tag & 0x20) === 0x20) {
        const children = [];
        const childBuffer = new Uint8Array(value);
        let childIndex = 0;
  
        while (childIndex < childBuffer.length) {
          const childParser = parseASN1(childBuffer.slice(childIndex));
          children.push(childParser.result);
          childIndex += childParser.offset;
        }
        return { offset: length + 2, result: { tag, length, children } };
      }
  
      // Return basic structure for primitive types
      return { offset: length + 2, result: { tag, length, value } };
    }
  
    return parse();
  }
  $scope.videoFormats = ['mkv', 'mp4', 'avi'];
  $scope.audioFormats = ['mp3', 'wav', 'aac'];
  $scope.imageFormats = ['png', 'jpeg', 'jpg', 'gif', 'bmp'];

  
  $scope.binToB64 = (bin) => {
      const binaryString = Array.from(bin).map((char) => char.charCodeAt(0)).map((byte) => String.fromCharCode(byte)).join('');
      return btoa(binaryString);
  };

  
  $scope.media_file_mime = (format, type = 'video') => {
      const references = {
          'mkv': 'video/x-matroska',
          'mp4': 'video/mp4',
          'mp3': 'audio/mpeg',
          'png': 'image/png',
          'jpeg': 'image/jpeg',
          'jpg': 'image/jpeg',
          'gif': 'image/gif',
          'bmp': 'image/bmp',
          'wav': 'audio/wav',
          'aac': 'audio/aac',
      };

      // Return predefined MIME type if exists
      if (references[format.toLowerCase()]) {
          return references[format.toLowerCase()];
      }

      // Fallback MIME type
      return `${type}/${format.toLowerCase()}`;
  };

  $scope.about_media_file = (format, payload) => {
      format = format.toLowerCase();

      let media_type = null;
      if ($scope.videoFormats.includes(format)) {
          media_type = 'video';
      } else if ($scope.audioFormats.includes(format)) {
          media_type = 'audio';
      } else if ($scope.imageFormats.includes(format)) {
          media_type = 'image';
      }

      if (!media_type) {
          throw new Error(`Unsupported media format: ${format}`);
      }

      // Generate data URI
      const mime = $scope.media_file_mime(format, media_type);
      const base64Payload = $scope.binToB64($scope.hex_to_ascii(payload));
      const dataUri = `data:${mime};base64,${base64Payload}`;

      return { media_type, mime, data_uri: dataUri };
  }
  $scope.showModalTag = (tag)=>{
    if($("#modal_"+tag).length)
    {
      $("#modal_"+tag).modal('show')
    }
  }
  $scope.hideModalTag = (tag)=>{
    if($("#modal_"+tag).length)
      {
        $("#modal_"+tag).modal('hide')
    }
  }

  $scope.formatCurrency = (amount, currency = 'XOF', locale = 'en-US') =>
    {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
        }).format(amount);
    }

  $scope.setScopeFromId = (id,dataset,target,target_column)=>{
    if($scope[dataset])
    {
      const match = $scope[dataset].filter(
          item=>{
              return (item.id == id)
          }
      )
      if(match.length)
      {
          $scope[target][target_column] = match[0]
          setTimeout(
            ()=>{
            //   setTimeout(()=>$('.select2').select2(),800)
              $scope.$apply()
            },200
          )
      }
    }
  }
  $scope.$on('$routeChangeStart', function(event, next, current) {
    console.log("Route is changing...");
    console.log("Next route:", next);
    console.log("Current route:", current);

    // setTimeout(()=>$('.select2').select2(),800)
  });

  $scope.$on('$routeChangeSuccess', function(event, current, previous) {
      console.log("Route change successful!");
      console.log("Current route:", current);
    //   setTimeout(()=>$('.select2').select2(),800)
  });

});


