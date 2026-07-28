import type { CheatSheetData } from "./types";

const spark: CheatSheetData = {
  title: "The Ultimate Spark Cheat Sheet",
  subtitle: "PySpark core API · partitioning & shuffles · Catalyst · pitfalls · production toolbelt",
  sections: [
    {
      title: "Session & Core Objects",
      color: "violet",
      rows: [
        { term: "SparkSession", desc: "Entry point for all DataFrame/SQL work", code: "spark = (SparkSession.builder\n  .appName('job')\n  .master('local[*]')\n  .getOrCreate())" },
        { term: "Read data", desc: "Parquet preferred: columnar, supports pushdown", code: "df = spark.read.parquet('path/')\ndf2 = spark.read.csv('f.csv', header=True, inferSchema=True)" },
        { term: "Write data", desc: "Partitioned output for downstream pruning", code: "df.write.mode('overwrite')\\\n  .partitionBy('date')\\\n  .parquet('out/')" },
        { term: "printSchema / show", desc: "Inspect structure and preview rows", code: "df.printSchema()\ndf.show(5)" },
        { term: "createOrReplaceTempView", desc: "Register a DataFrame for Spark SQL", code: "df.createOrReplaceTempView('orders')\nspark.sql('SELECT * FROM orders')" },
        { term: "RDD (legacy, low-level)", desc: "Schema-unaware; DataFrame is the modern default", code: "rdd = spark.sparkContext.textFile('f.txt')\nrdd.flatMap(lambda l: l.split(' '))" },
        { term: "spark.stop()", desc: "Release cluster resources at job end", code: "spark.stop()" },
      ],
    },
    {
      title: "Transformations vs Actions (Laziness)",
      color: "blue",
      rows: [
        { term: "Transformations (lazy)", desc: "Build the plan; nothing executes yet", code: "filtered = df.filter(df.amount > 100)\nselected = df.select('id', 'amount')" },
        { term: "Actions (trigger execution)", desc: "Force the whole DAG to actually run", code: "df.collect()\ndf.count()\ndf.show()\ndf.write.parquet('out/')" },
        { term: "collect() danger", desc: "Pulls ALL rows to the driver -- can OOM it", code: "-- avoid on large data:\nrows = df.collect()\n-- safer: df.take(20) or write to storage" },
        { term: "explain(True)", desc: "Show parsed/analyzed/optimized/physical plan", code: "df.explain(True)" },
        { term: "DAG stages", desc: "A new stage starts at every shuffle boundary", code: "-- stage 1: read+filter\n-- [SHUFFLE]\n-- stage 2: aggregate" },
      ],
    },
    {
      title: "Partitioning & Shuffles",
      color: "emerald",
      rows: [
        { term: "getNumPartitions", desc: "Check current partition count", code: "df.rdd.getNumPartitions()" },
        { term: "repartition(n)", desc: "Full shuffle to reach exact partition count", code: "df.repartition(8)\ndf.repartition(8, 'region')  # key-based" },
        { term: "coalesce(n)", desc: "Merge partitions WITHOUT a full shuffle (cheaper, only reduces count)", code: "df.coalesce(2)" },
        { term: "groupBy triggers a shuffle", desc: "Rows redistributed by key across executors", code: "df.groupBy('region').agg(\n  F.sum('amount').alias('total'))" },
        { term: "join triggers a shuffle (usually)", desc: "Both sides redistributed by join key unless broadcast", code: "df.join(other, on='id', how='left')" },
        { term: "shuffle partition count", desc: "Tune for data size, default is often wrong", code: "spark.conf.set(\n  'spark.sql.shuffle.partitions', '200')" },
        { term: "spark.sql.shuffle.partitions", desc: "Too few = idle cores; too many = scheduling overhead", code: "-- rule of thumb: size to actual\n-- data volume, not the default" },
      ],
    },
    {
      title: "Everyday Operations",
      color: "amber",
      rows: [
        { term: "Filter + select", desc: "Push down early to reduce shuffle volume", code: "df.filter(F.col('amount') > 0)\\\n  .select('id', 'amount', 'region')" },
        { term: "withColumn", desc: "Add or replace a column", code: "df.withColumn('date', F.to_date('ts'))" },
        { term: "groupBy + agg", desc: "Combine multiple aggregates in ONE shuffle pass", code: "df.groupBy('region').agg(\n  F.sum('amt').alias('total'),\n  F.count('*').alias('n'))" },
        { term: "Window functions", desc: "Per-row values relative to a group, no collapse", code: "w = Window.partitionBy('grp').orderBy('ts')\ndf.withColumn('rank', F.rank().over(w))" },
        { term: "Broadcast join", desc: "Force small side to skip the shuffle entirely", code: "df.join(F.broadcast(small_df), on='id')" },
        { term: "Spark SQL", desc: "Same optimizer as DataFrame API -- interchangeable", code: "spark.sql('SELECT region, SUM(amt)\n  FROM orders GROUP BY region')" },
      ],
    },
    {
      title: "Caching, Pitfalls & Skew",
      color: "rose",
      rows: [
        { term: "cache() / persist()", desc: "Materialize a reused DataFrame in memory", code: "df.cache()\ndf.count()  # forces materialization NOW" },
        { term: "unpersist()", desc: "Free memory once no longer needed", code: "df.unpersist()" },
        { term: "Missing cache = recompute", desc: "Reused DataFrame without cache re-reads + re-runs EVERY time", code: "-- WRONG: cleaned used 2x, no cache\na = cleaned.groupBy('x').count()\nb = cleaned.groupBy('y').sum('amt')" },
        { term: "Data skew", desc: "One key dominates; a few tasks run far longer than the rest", code: "-- symptom: Spark UI shows most\n-- tasks fast, a handful very slow" },
        { term: "Salting (skew fix)", desc: "Spread a skewed key across artificial sub-buckets", code: "df.withColumn('salt', (F.rand()*10).cast('int'))\\\n  .withColumn('key2', F.concat_ws('_','key','salt'))" },
        { term: "Over-caching", desc: "Cached data competes with shuffles for the SAME memory pool", code: "-- don't cache a DataFrame used only once" },
        { term: "Naive repeated groupBy", desc: "Re-shuffles the same base data for every separate aggregation", code: "-- WRONG: 2 separate shuffle passes\nraw.groupBy('k').count()\nraw.groupBy('k').sum('v')\n-- RIGHT: one pass, both aggregates" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Parquet over CSV", desc: "Columnar: predicate pushdown + column pruning", code: "df.write.parquet('out/')  # not .csv()" },
        { term: "partitionBy on write", desc: "Downstream reads can skip irrelevant partitions", code: "df.write.partitionBy('date').parquet('out/')" },
        { term: "Spark UI", desc: "Stages/tasks view -- first stop for any slow job", code: "-- check per-task duration distribution\n-- for skew signatures" },
        { term: "Adaptive Query Execution (AQE)", desc: "Re-optimizes plan mid-run using real stats", code: "spark.conf.set(\n  'spark.sql.adaptive.enabled', 'true')" },
        { term: "Cluster deployment", desc: "Driver/executor sizing, pinned versions", code: "-- spark-submit on Kubernetes/YARN\n-- pin image + Spark version explicitly" },
        { term: "Orchestration", desc: "Airflow schedules/retries Spark jobs as pipeline tasks", code: "-- SparkSubmitOperator or\n-- KubernetesPodOperator in an Airflow DAG" },
        { term: "Spark's ML-pipeline role", desc: "Feature engineering & preprocessing, NOT deep learning training", code: "-- Spark: prepare features at scale\n-- PyTorch/TensorFlow: train the model" },
      ],
    },
  ],
};

export default spark;
