(function () {
  const firebaseConfig = window.FIREBASE_CONFIG || null;

  let app = null;
  let db = null;
  let auth = null;

  function init() {
    try {
      if (!window.firebase || !firebaseConfig) return false;
      if (app) return true;
      app = window.firebase.initializeApp(firebaseConfig);
      if (!window.firebase.database || !window.firebase.auth) return false;
      db = window.firebase.database();
      auth = window.firebase.auth();
      return true;
    } catch (err) {
      return false;
    }
  }

  function getRef(workspace) {
    const key = workspace || "local";
    return db.ref("tudo-em-ordem/workspaces/" + key);
  }

  function pull(workspace) {
    if (!db) return Promise.resolve(null);
    return getRef(workspace)
      .once("value")
      .then((snap) => snap.val())
      .catch(() => null);
  }

  function subscribe(workspace, onChange) {
    if (!db) return null;
    const ref = getRef(workspace);
    const handler = (snap) => {
      const value = snap.val();
      onChange(value);
    };
    ref.on("value", handler);
    return () => ref.off("value", handler);
  }

  function push(workspace, data) {
    if (!db) return Promise.resolve();
    return getRef(workspace).set(data);
  }

  function onAuthStateChanged(callback) {
    if (!auth) return null;
    return auth.onAuthStateChanged(callback);
  }

  function signIn(email, password) {
    if (!auth) return Promise.reject(new Error("auth-not-ready"));
    return auth.signInWithEmailAndPassword(email, password);
  }

  function signUp(email, password) {
    if (!auth) return Promise.reject(new Error("auth-not-ready"));
    return auth.createUserWithEmailAndPassword(email, password);
  }

  function signOut() {
    if (!auth) return Promise.resolve();
    return auth.signOut();
  }

  function getUser() {
    return auth ? auth.currentUser : null;
  }

  function isAuthenticated() {
    return !!(auth && auth.currentUser);
  }

  window.FirebaseAPI = {
    init,
    pull,
    subscribe,
    push,
    onAuthStateChanged,
    signIn,
    signUp,
    signOut,
    getUser,
    isAuthenticated
  };
})();
