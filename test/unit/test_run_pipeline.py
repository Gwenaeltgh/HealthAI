import os
import tempfile
import unittest

import run_pipeline


class TestRunPipeline(unittest.TestCase):
    def test_build_parser_defaults(self):
        parser = run_pipeline.build_parser()
        args = parser.parse_args([])
        self.assertEqual(args.profile, 'complete')
        self.assertFalse(args.force)
        self.assertFalse(args.skip_download)
        self.assertIsNone(args.max_rows)

    def test_has_silver_ready_false_when_missing(self):
        with tempfile.TemporaryDirectory() as tmp:
            prev = os.getcwd()
            try:
                os.chdir(tmp)
                os.makedirs(os.path.join('medaillon', 'data', 'silver'), exist_ok=True)
                # No files created
                self.assertFalse(run_pipeline.has_silver_ready())
            finally:
                os.chdir(prev)

    def test_has_silver_ready_true_when_all_expected_files_exist(self):
        with tempfile.TemporaryDirectory() as tmp:
            prev = os.getcwd()
            try:
                os.chdir(tmp)
                silver_dir = os.path.join('medaillon', 'data', 'silver')
                os.makedirs(silver_dir, exist_ok=True)

                for name in run_pipeline.EXPECTED_SILVER_FILES:
                    with open(os.path.join(silver_dir, name), 'w', encoding='utf-8') as f:
                        f.write('header\n')

                self.assertTrue(run_pipeline.has_silver_ready())
            finally:
                os.chdir(prev)


if __name__ == '__main__':
    unittest.main()
