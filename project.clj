(defproject mailcrunch "0.1.0-SNAPSHOT"
  :description "An email delivery engine"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [korma "0.3.0-RC5"]
                 [postgresql "9.1-901.jdbc4"]
                 ;web stuff
								 [compojure "1.1.5"]
                 [ring "1.2.0-beta1"]
                 [ring/ring-core "1.2.0-beta1"]
                 [ring/ring-json "0.2.0"]
								 
								 ;rest DSL
								 [liberator "0.8.0"]
								 
								 ;json parser
								 [cheshire "5.0.2"]
								 ;For managing dates using Joda time
								 [clj-time "0.5.0"]
								 ;for sending emails
								 [com.draines/postal "1.10.2"]
								 
								 ;for scheduling deliveries
								 [clojurewerkz/quartzite "1.1.0"]
								 ]

  :ring {:handler mailcrunch.server/entry
         :adapter {:port 8000}}

  )
