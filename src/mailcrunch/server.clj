(ns mailcrunch.server
  (:require
   [ring.adapter.jetty :as jetty]
   [clojure.java.io :as io]
   [mailcrunch.backend.db :as mdb]
   [mailcrunch.view.navtree :as navtree]
   [mailcrunch.view.delivery :as delivery])
  (:use
   [ring.util.mime-type :only [ext-mime-type]]
   [ring.middleware.multipart-params :only [wrap-multipart-params]]
   [ring.middleware.json]
   [ring.util.response :only [header]]
   [compojure.handler :only [api]]
   [compojure.core :only [routes ANY]]
   [liberator.core :only [defresource wrap-trace-as-response-header]])
  )

(defonce RPC_BASE_URL "/rpc")

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


(defn build-url [url]
  (if (#{\/} (.charAt url 0))
    (str RPC_BASE_URL url)
    (str RPC_BASE_URL "/" url)))


(defn assemble-routes []
  (->
   (routes
    (ANY "/" [] "/public/index.html")
    (ANY "/static/*" [] static)
    (ANY (build-url  "navtree") [] navtree/handler)
    (ANY (build-url "delivery") [] (delivery/handle-single-delivery nil))
    (ANY (build-url "delivery/count") [] delivery/handle-delivery-count)
		(ANY (build-url "delivery/send") [] delivery/handle-send-delivery)
		(ANY (build-url "delivery/:id") [id] (fn [ctx] 
                                           (delivery/handle-single-delivery id)))

    
		
		)
	 
    ;(ANY (build-url "delivery/all") [] delivery/all-deliveries))
   (wrap-trace-as-response-header)
   (wrap-json-response)
	 (wrap-multipart-params)))




(defn create-handler []
  (fn [request]
    (
     (->
      (assemble-routes)
      api
      wrap-multipart-params)
     request)))

(def entry (create-handler))
