(ns mailcrunch.server
  (:require
   [ring.adapter.jetty :as jetty]
   [clojure.java.io :as io]
   [mailcrunch.backend.db :as mdb]
   [mailcrunch.view.navtree :as navtree])
  (:use
   [ring.util.mime-type :only [ext-mime-type]]
   [ring.middleware.multipart-params :only [wrap-multipart-params]]
   [ring.util.response :only [header]]
   [compojure.handler :only [api]]
   [compojure.core :only [routes ANY]]
   [liberator.core :only [defresource wrap-trace-as-response-header]])
  )

(let [static-dir (io/file "public")]
  (defresource static

    :available-media-types
    #(let [path (get-in % [:request :route-params :*])]
       (if-let [mime-type (ext-mime-type path)]
         [mime-type]
         []))

    :exists?
    #(let [path (get-in % [:request :route-params :*])]
       (let [f (io/file static-dir path)]
         [(.exists f) {::file f}]))

    :handle-ok (fn [{f ::file}] f)

    :last-modified (fn [{f ::file}] (.lastModified f))))


(defn assemble-routes []
  (->
   (routes
    (ANY "/static/*" [] static)
    (ANY "/navtree" [] navtree/handler))
   (wrap-trace-as-response-header)))




(defn create-handler []
  (fn [request]
    (
     (->
      (assemble-routes)
      api
      wrap-multipart-params)
     request)))

(def entry (create-handler))
