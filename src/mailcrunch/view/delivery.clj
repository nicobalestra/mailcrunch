(ns mailcrunch.view.delivery
  (:require [mailcrunch.model.delivery :as model]
						[mailcrunch.backend.mail :as mail]
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
	:handle-ok (if (not (nil? id))
							 (ch/generate-string (model/get-deliveries {:id (Integer. id)}))
							 (ch/generate-string (model/get-deliveries)))
  :available-media-types ["text/json" "application/json"]
	:method-allowed? (request-method-in :post :get :put :delete)
	:post! (fn [ctx]
					 (let [id (-> ctx
												(get-in [:request :form-params] )
												(first)
												(val)
												(ch/parse-string true)
												(model/save-delivery))]
										 {:result id}))
	:post-redirect? false
		
	:handle-created (fn [ctx] (get ctx :result))
 )

(defresource handle-send-delivery [id]
	:available-media-types ["text/json" "application/json"]
	:method-allowed? (request-method-in :put)
	:put! (fn [ctx]
					 (let [id (-> ctx
												(get-in [:request :form-params] )
												(first)
												(val)
												(ch/parse-string true)
												(model/save-delivery))]
										 {:result id}))
	:post-redirect? false
		
	:handle-created (fn [ctx] (get ctx :result))
 )

