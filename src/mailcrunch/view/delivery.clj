(ns mailcrunch.view.delivery
  (:require [mailcrunch.model.delivery :as model]
            [cheshire.core :as ch])
  (:use [liberator.core :only [defresource request-method-in]]))

(defresource handle-delivery-count
  :handle-ok (ch/generate-string  (first (model/count)))
  :available-media-types ["text/json" "application/json"]
 )


(defresource all-deliveries
  :handle-ok (fn [ctx] 
               (ch/generate-string (model/get-deliveries)))
  :available-media-types ["text/json" "application/json"]
 )


(defresource handle-single-delivery [id]
	:handle-ok (ch/generate-string (model/get-deliveries {:id (Integer. id)}))
  :available-media-types ["text/json" "application/json"]
	:method-allowed? (request-method-in :post :get :put :delete)
	:post! (fn [ctx] (println "POSTED " ctx) {:result id})
	:post-redirect? false
		
	:handle-created (fn [ctx] (get ctx :result))
 )
