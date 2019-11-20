import { NativeModules } from "react-native";
import Q from "q";

const { RNSslPinning } = NativeModules;

const fetch = (url, obj, callback) => {
  let deferred = Q.defer();
  RNSslPinning.fetch(url, obj, (err, res) => {
    if (err && typeof err != "object") {
      deferred.reject(err);
    }

    let data = err || res;

    // Since okHttp's request builder's response does not accept any un-official http status
    // therefore, temporarily we set if response is null or undefined
    // the lib will return an object as status 601 and url
    if (data) {
      data.json = function() {
        return Q.fcall(function() {
          return JSON.parse(data.bodyString);
        });
      };

      data.text = function() {
        return Q.fcall(function() {
          return data.bodyString;
        });
      };

      data.url = url;

      if (err) {
        deferred.reject(data);
      } else {
        deferred.resolve(data);
      }
    } else {
      // the lib will return an object as status 601 and url
      deferred.reject({
        url: url,
        status: 601
      });
    }

    deferred.promise.nodeify(callback);
  });

  return deferred.promise;
};

const getCookies = domain => {
  if (domain) {
    return RNSslPinning.getCookies(domain);
  }

  return Promise.reject("Domain cannot be empty");
};

const removeCookieByName = name => {
  if (name) {
    return RNSslPinning.removeCookieByName(name);
  }

  return Promise.reject("Cookie Name cannot be empty");
};

export { fetch, getCookies, removeCookieByName };
