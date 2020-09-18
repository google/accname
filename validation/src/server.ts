import express from 'express';
import path from 'path';
import fs from 'fs';
import favicon from 'serve-favicon';
import {runHTMLSnippetComparison} from './lib/snippet';
import {runURLComparison} from './lib/url';
import {runWPT} from './lib/wpt';
import {NoTargetError} from './lib/node_ref';

const app = express();
// Set static folder as src/static
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(favicon(path.join(__dirname, 'static/favicon.ico')));
app.use(express.json());

/**
 * Web-Page endpoints
 */

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'static/index.html'));
});

app.get('/case/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, 'static/case.html'));
});

app.get('/summary/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, 'static/summary.html'));
});

app.get('/wpt/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, 'static/wpt.html'));
});

/**
 * Comparison API endpoints
 */

app.get('/api/preview', (_req, res) => {
  fs.readFile(path.join(__dirname, '../output/preview.json'), (err, data) => {
    if (err) {
      res.status(500).json(err);
    } else if (data) {
      res.status(200).json(JSON.parse(data.toString()));
    } else {
      res.status(404).json({message: 'Preview could not be found.'});
    }
  });
});

app.get('/api/summary/:id', (req, res) => {
  const summaryId = req.params.id;
  fs.readFile(
    path.join(__dirname, `../output/url_summary/summary_${summaryId}.json`),
    (err, data) => {
      if (err) {
        res.status(500).json(err);
      } else if (data) {
        res.status(200).json(JSON.parse(data.toString()));
      } else {
        res.status(404).json({message: 'Summary could not be found.'});
      }
    }
  );
});

app.get('/api/case/:id', (req, res) => {
  const caseId = req.params.id;
  fs.readFile(
    path.join(__dirname, `../output/case/case_${caseId}.json`),
    (err, data) => {
      if (err) {
        res.status(500).json(err);
      } else if (data) {
        res.status(200).json(JSON.parse(data.toString()));
      } else {
        res.status(404).json({message: 'Case could not be found.'});
      }
    }
  );
});

app.get('/api/wpt/:id', (req, res) => {
  const wptId = req.params.id;
  fs.readFile(
    path.join(__dirname, `../output/wpt_result/wpt_${wptId}.json`),
    (err, data) => {
      if (err) {
        res.status(400).json(err);
      } else if (data) {
        res.status(200).json(JSON.parse(data.toString()));
      } else {
        res.status(404).json({message: 'Results could not be found.'});
      }
    }
  );
});

app.post('/api/runSnippetComparison', async (req, res) => {
  const inputSnippet = req.body.snippet as string;
  try {
    const result = await runHTMLSnippetComparison(inputSnippet);
    res.status(200).json(result);
  } catch (err) {
    console.log('An Error occurred while running a SNIPPET COMPARISON:', err);
    if (err instanceof NoTargetError) {
      res.status(400).json(err);
    }
    res.status(500).json(err);
  }
});

app.post('/api/runURLComparison', async (req, res) => {
  const inputURL = req.body.url as string;
  try {
    const result = await runURLComparison(inputURL);
    res.status(200).json(result);
  } catch (err) {
    console.log('An Error occurred while running a URL COMPARISON:', err);
    res.status(500).json(err);
  }
});

app.get('/api/runWPTComparison', async (_req, res) => {
  try {
    const result = await runWPT();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.listen(3000, () => console.log('App listening on port 3000'));
