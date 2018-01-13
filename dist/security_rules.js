{
  "rules": {
    "users": {
      "$uid": {
        ".write": "data.val() == null && newData.child('isAdmin').val() == null || data.val() != null && newData.val() != null && (newData.child('isAdmin').val() == null && data.child('isAdmin').val() == null && (auth != null && auth.uid == $uid) || root.child('users').child(auth.uid).child('isAdmin').val() == true)"
      },
      ".read": "true",
      ".indexOn": [
        "email"
      ]
    },
    "comments": {
      "$commentId": {
        ".write": "data.val() == null || data.val() != null && newData.val() == null && (data.child('uid').val() == auth.uid || data.child('rootCommentUid').val() == auth.uid || root.child('users').child(auth.uid).child('isAdmin').val() == true)"
      },
      ".read": "true",
      ".indexOn": [
        "rootCommentId",
        "pageURL"
      ]
    },
    "pageComments": {
      ".read": "true",
      ".write": "true"
    },
    "votes": {
      ".read": "true",
      ".write": "true"
    },
    "notifications": {
      "$uid": {
        "$notifId": {
          ".write": "data.val() == null || data.val() != null && newData.val() != null && (auth != null && auth.uid == $uid || root.child('users').child(auth.uid).child('isAdmin').val() == true) || data.val() != null && newData.val() == null && (auth != null && auth.uid == $uid || root.child('users').child(auth.uid).child('isAdmin').val() == true)"
        },
        ".read": "auth != null && auth.uid == $uid"
      }
    },
    "reported": {
      "$commentId": {
        "$uid": {
          ".write": "data.val() == null && (auth != null && auth.uid == $uid) || data.val() != null && newData.val() != null && root.child('users').child(auth.uid).child('isAdmin').val() == true || data.val() != null && newData.val() == null && root.child('users').child(auth.uid).child('isAdmin').val() == true",
          ".read": "auth != null && auth.uid == $uid || root.child('users').child(auth.uid).child('isAdmin').val() == true"
        }
      },
      ".read": "root.child('users').child(auth.uid).child('isAdmin').val() == true"
    },
    "ban": {
      ".read": "true",
      ".write": "root.child('users').child(auth.uid).child('isAdmin').val() == true"
    },
    "plugins": {
      "$pluginName": {
        "$r": {
          "$c": {
            "$u": {
              "$d": {
                "u": {
                  ".write": "data.val() == null && ($c.contains('a') ? true : $c.contains('s') ? auth != null : root.child('users').child(auth.uid).child('isAdmin').val() == true) || data.val() != null && newData.val() != null && ($u.contains('a') ? true : $u.contains('s') ? auth != null : root.child('users').child(auth.uid).child('isAdmin').val() == true) || data.val() != null && newData.val() == null && ($d.contains('a') ? true : $d.contains('s') ? auth != null : root.child('users').child(auth.uid).child('isAdmin').val() == true)",
                  ".read": "$r.contains('a') ? true : $r.contains('s') ? auth != null : root.child('users').child(auth.uid).child('isAdmin').val() == true"
                },
                "o1": {
                  "$key": {
                    ".write": "data.val() == null && ($c.contains('a') ? true : $c.contains('s') ? auth != null : $c.contains('r') ? data.child('relatedUser').val() == auth.uid || ($key == auth.uid || (data.val() == null ? newData.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid)) : $c.contains('o') ? $key == auth.uid || (data.val() == null ? newData.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid) : root.child('users').child(auth.uid).child('isAdmin').val() == true) || data.val() != null && newData.val() != null && ($u.contains('a') ? true : $u.contains('s') ? auth != null : $u.contains('r') ? data.child('relatedUser').val() == auth.uid || ($key == auth.uid || (data.val() == null ? newData.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid)) : $u.contains('o') ? $key == auth.uid || (data.val() == null ? newData.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid) : root.child('users').child(auth.uid).child('isAdmin').val() == true) || data.val() != null && newData.val() == null && ($d.contains('a') ? true : $d.contains('s') ? auth != null : $d.contains('r') ? data.child('relatedUser').val() == auth.uid || ($key == auth.uid || (data.val() == null ? newData.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid)) : $d.contains('o') ? $key == auth.uid || (data.val() == null ? newData.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid) : root.child('users').child(auth.uid).child('isAdmin').val() == true)",
                    ".read": "$r.contains('a') ? true : $r.contains('s') ? auth != null : $r.contains('r') ? data.child('relatedUser').val() == auth.uid || ($key == auth.uid || (data.val() == null ? data.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid)) : $r.contains('o') ? $key == auth.uid || (data.val() == null ? data.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid) : root.child('users').child(auth.uid).child('isAdmin').val() == true"
                  }
                },
                "o2": {
                  "$nodeName": {
                    "$key": {
                      ".write": "data.val() == null && ($c.contains('a') ? true : $c.contains('s') ? auth != null : $c.contains('r') ? data.child('relatedUser').val() == auth.uid || ($key == auth.uid || (data.val() == null ? newData.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid)) : $c.contains('o') ? $key == auth.uid || (data.val() == null ? newData.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid) : root.child('users').child(auth.uid).child('isAdmin').val() == true) || data.val() != null && newData.val() != null && ($u.contains('a') ? true : $u.contains('s') ? auth != null : $u.contains('r') ? data.child('relatedUser').val() == auth.uid || ($key == auth.uid || (data.val() == null ? newData.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid)) : $u.contains('o') ? $key == auth.uid || (data.val() == null ? newData.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid) : root.child('users').child(auth.uid).child('isAdmin').val() == true) || data.val() != null && newData.val() == null && ($d.contains('a') ? true : $d.contains('s') ? auth != null : $d.contains('r') ? data.child('relatedUser').val() == auth.uid || ($key == auth.uid || (data.val() == null ? newData.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid)) : $d.contains('o') ? $key == auth.uid || (data.val() == null ? newData.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid) : root.child('users').child(auth.uid).child('isAdmin').val() == true)",
                      ".read": "$r.contains('a') ? true : $r.contains('s') ? auth != null : $r.contains('r') ? data.child('relatedUser').val() == auth.uid || ($key == auth.uid || (data.val() == null ? data.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid)) : $r.contains('o') ? $key == auth.uid || (data.val() == null ? data.child('ownerUid').val() == auth.uid : data.child('ownerUid').val() == auth.uid) : root.child('users').child(auth.uid).child('isAdmin').val() == true"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
