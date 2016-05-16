lazy val root = (project in file(".")).
  settings(
    name := "sentiment-jar",
    version := "1.0",
    mainClass in Compile := Some("linuxcon.SentimentJob")        
  )

unmanagedBase := baseDirectory.value / "lib"

resolvers += "Job Server Bintray" at "https://dl.bintray.com/spark-jobserver/maven"

libraryDependencies ++= Seq(
   "org.apache.spark" %% "spark-core"        % "1.5.2" % "provided",
   "org.apache.spark" %% "spark-sql"         % "1.5.2" % "provided",
   "com.typesafe"     %  "config"            % "1.3.0" % "provided",
   "spark.jobserver"  %% "job-server-api"    % "0.6.1" % "provided",
   "spark.jobserver"  %% "job-server-extras" % "0.6.1" % "provided",
   "edu.stanford.nlp" %  "stanford-corenlp"  % "3.5.2" classifier "models",
   "edu.stanford.nlp" %  "stanford-corenlp"  % "3.5.2",
   "edu.stanford.nlp" %  "stanford-parser"   % "3.5.2"
)

// META-INF discarding
mergeStrategy in assembly <<= (mergeStrategy in assembly) { (old) =>
   {
    case PathList("META-INF", xs @ _*) => MergeStrategy.discard
    case x => MergeStrategy.first
   }
}
