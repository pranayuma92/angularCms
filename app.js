const angularCms = angular.module('angularCms', ['ui.router', 'firebase','textAngular']);

angularCms.config(function($stateProvider, $urlRouterProvider,$locationProvider){
	// $locationProvider.html5Mode(true);
	$urlRouterProvider.otherwise('/');

	$stateProvider

    .state('admin', {
	    url: '/admin',
	    abstract: true,
	    templateUrl: 'admin/sidebar.html',
	    controller: 'AppCtrl'
	 })

    .state('admin.all-post', {
      url: '/all-post',
      views: {
        'menuContent': {
          templateUrl: 'admin/all-post.html',
          controller: 'AllpostCtrl'
		 
        }
      }
    })

    .state('admin.add-post', {
      url: '/add-post',
      views: {
        'menuContent': {
          templateUrl: 'admin/add-post.html',
		  controller: 'AddpostCtrl'
        }
      }
    })

    .state('admin.edit-post', {
      url: '/edit-post/{postID}',
      views: {
        'menuContent': {
          templateUrl: 'admin/edit-post.html',
		  controller: 'EditpostCtrl'
        }
      }
    })

    .state('admin.main', {
      url: '/main',
      views: {
        'menuContent': {
          templateUrl: 'admin/main.html',
		 
        }
      }
    })

    .state('login', {
      url: '/login',
      templateUrl: 'admin/login.html',
      controller: 'LoginCtrl'
    })

    .state('register', {
      url: '/register',
      templateUrl: 'admin/register.html',
      controller: 'RegisterCtrl'
    })


   //Site

    .state('home', {
      url: '/',
      templateUrl: 'site/home.html',
      controller: 'homeCtrl'
		
    })

    .state('post', {
      url: '/post/{slug}',
      templateUrl: 'site/post.html',
      controller: 'postCtrl',
      params:{postid:null}
		
    })
});

angularCms.factory('firebaseData', function($firebase){
	let ref = new Firebase("https://blog-app-da9dc.firebaseio.com/"),
      	refPost = new Firebase("https://blog-app-da9dc.firebaseio.com/post"),
      	refComments = new Firebase("https://blog-app-da9dc.firebaseio.com/comment"),
      	refUser = new Firebase("https://blog-app-da9dc.firebaseio.com/users"),
      	refConfig = new Firebase("https://blog-app-da9dc.firebaseio.com/site_config");

    return {
     	ref: function() {
	        return ref;
	      },
	      refPost: function() {
	        return refPost;
	      },
	      refComments: function() {
	        return refComments;
	      },
	      refUser: function() {
	        return refUser;
	      },
	      refConfig: function() {
	        return refConfig;
	      },
    }
});

angularCms.filter('spaceless',function() {
    return function(input) {
        if (input) {
            return input.replace(/\s+/g, '-').toLowerCase();    
        }
    }
});

angularCms.filter('limitHtml', function() {
	    return function(text, limit) {

	        var changedString = String(text).replace(/<[^>]+>/gm, '');
	        var length = changedString.length;

	        return changedString.length > limit ? changedString.substr(0, limit - 1) + '...' : changedString;
	    }
	});


angularCms.controller('AppCtrl', function($scope, $state){

	$scope.logout=function(){
      firebase.auth().signOut().then(function() {

        alert('success')
        $state.go('login', {}, {location: "replace"});

      }, function(error) {
       
          alert('failed')
      });

    }

});

angularCms.controller('AllpostCtrl', function($scope, $state, firebaseData, $firebaseArray){
	firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.user_info=user;  
      }else{
        $state.go('login', {}, {location: "replace"});
      }
    });

    $scope.postData = $firebaseArray(firebaseData.refPost())
});

angularCms.controller('LoginCtrl', function($scope,$state){

	firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

         $state.go('admin.all-post', {}, {location: "replace"});

      }else{
        $state.go('login', {}, {location: "replace"});
      }
    });


    $scope.loginEmail = function(formName,cred) {


      if(formName.$valid) {  

        
          firebase.auth().signInWithEmailAndPassword(cred.email,cred.password).then(function(result) {

             
              alert('success')

            },
            function(error) {
              alert('failed')
            }
        );

      }else{
         alert('data not valid')
      }



    };
});

angularCms.controller('RegisterCtrl', function($scope,$state,firebaseData, $firebaseObject){
	$scope.signupEmail = function (formName, cred) {

      if (formName.$valid) {  
      
        firebase.auth().createUserWithEmailAndPassword(cred.email, cred.password).then(function (result) {

          
            var result = firebase.auth().currentUser;

            result.updateProfile({
              displayName: cred.name,
              photoURL: "default_dp"
            }).then(function() {}, function(error) {});

           
            firebaseData.refUser().child(result.uid).set({
              telephone: cred.phone,
              name: cred.name,
              email: cred.email
            });

           
            $state.go('admin.all-post', {}, {location: "replace"});
             alert('success')

        }, function (error) {
           ;
             alert('error')
        });

      }else{
         alert('data not valid')
      }

    };


});

angularCms.controller('AddpostCtrl', function($scope, $state, firebaseData,$filter){

	firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.user_info=user;  
      }else{
        $state.go('login', {}, {location: "replace"});
      }
    });

    var today = new Date();
	    var dd = today.getDate();
	    var mm = today.getMonth()+1; 
	    var yyyy = today.getFullYear();

	    if(dd<10) {
	      dd = '0'+dd
	    } 

	    if(mm<10) {
	      mm = '0'+mm
	    } 

	    currentDate = dd + '-' + mm + '-' + yyyy;

	    function checkTime(i) {
            if (i < 10) {
              i = "0" + i;
            }
            return i;
          }

          var today = new Date();
          var h = today.getHours();
          var m = today.getMinutes();
          var s = today.getSeconds();
         
          m = checkTime(m);
          s = checkTime(s);

          currentTime = h+':'+m;

	$scope.submitPost = function(post){
		firebaseData.refPost().push({
			content : post.content,
			title :post.title,
			author: $scope.user_info.displayName,
			author_id :$scope.user_info.uid,
			status: 'published',
			createAt :  currentDate+' at '+currentTime,
			lastUpdate: currentDate+' at '+currentTime,
			image: post.image,
			url: $filter('spaceless')(post.title)
		});

		$scope.post = {};
		$state.go('admin.all-post', {}, {location: "replace"});
	}

	$scope.draftPost = function(post){
		firebaseData.refPost().push({
			content : post.content,
			title :post.title,
			author: $scope.user_info.displayName,
			author_id :$scope.user_info.uid,
			status: 'draft',
			createAt :  currentDate+' at '+currentTime,
			lastUpdate: currentDate+' at '+currentTime,
			image: post.image,
			url: $filter('spaceless')(post.title)
		});

		$scope.post = {};
		$state.go('admin.all-post', {}, {location: "replace"});
	}
});

angularCms.controller('EditpostCtrl', function($scope, $state,$stateParams, firebaseData, $firebaseObject, $filter){
	$scope.post = $firebaseObject(firebaseData.refPost().child($stateParams.postID));

	var today = new Date();
	    var dd = today.getDate();
	    var mm = today.getMonth()+1;
	    var yyyy = today.getFullYear();

	    if(dd<10) {
	      dd = '0'+dd
	    } 

	    if(mm<10) {
	      mm = '0'+mm
	    } 

	    currentDate = dd + '-' + mm + '-' + yyyy;

	    function checkTime(i) {
            if (i < 10) {
              i = "0" + i;
            }
            return i;
          }

          var today = new Date();
          var h = today.getHours();
          var m = today.getMinutes();
          var s = today.getSeconds();
          
          m = checkTime(m);
          s = checkTime(s);

          currentTime = h+':'+m;

	$scope.updatePost = function(post){
		firebaseData.refPost().child($stateParams.postID).update({
			content : post.content,
			title :post.title,
			status: 'published',
			lastUpdate: currentDate+' at '+currentTime,
			image: post.image,
			url: $filter('spaceless')(post.title)
		});

		$state.go('admin.all-post', {}, {location: "replace"});
	}

	$scope.draftPost = function(post){
		firebaseData.refPost().child($stateParams.postID).update({
			content : post.content,
			title :post.title,
			status: 'draft',
			lastUpdate: currentDate+' at '+currentTime,
			image: post.image,
			url: $filter('spaceless')(post.title)
		});

		$state.go('admin.all-post', {}, {location: "replace"});
	}

	$scope.deletePost = function(post){
		firebaseData.refPost().child($stateParams.postID).remove();

		$state.go('admin.all-post', {}, {location: "replace"});
	}
});

angularCms.controller('homeCtrl', function($scope, $state,$stateParams, firebaseData, $firebaseObject, $firebaseArray){
	$scope.postData = $firebaseArray(firebaseData.refPost().orderByChild('status').equalTo('published'));
	$scope.site = $firebaseObject(firebaseData.refConfig());
});

angularCms.controller('postCtrl', function($scope, $state,$stateParams, firebaseData, $firebaseObject, $firebaseArray){
	$scope.dataPost = $firebaseObject(firebaseData.refPost().child($stateParams.postid));

	console.log($scope.dataPost)
	
});

