<?php
use ReflectionMethod;

class ReflectionTypeHint
{
	protected static $hints = array(
		'int'      => 'is_int',
		'integer'  => 'is_int',
		'digit'    => 'ctype_digit',
		'number'   => 'ctype_digit',
		'float'    => 'is_float',
		'double'   => 'is_float',
		'real'     => 'is_float',
		'numeric'  => 'is_numeric',
		'str'      => 'is_string',
		'string'   => 'is_string',
		'char'     => 'is_string',
		'bool'     => 'is_bool',
		'boolean'  => 'is_bool',
		'null'     => 'is_null',
		'array'    => 'is_array',
		'obj'      => 'is_object',
		'object'   => 'is_object',
		'res'      => 'is_resource',
		'resource' => 'is_resource',
		'scalar'   => 'is_scalar', 
		'cb'       => 'is_callable',
		'callback' => 'is_callable',
	);

	private function __construct() {}

	public static function isValid()
	{
		if (! assert_options(ASSERT_ACTIVE)) return true;
		$bt = self::debugBacktrace(null, 1);
		extract($bt); 
		if (! $args) return true;
		$r = new ReflectionMethod($class, $function);
		$doc = $r->getDocComment();
		$cache_id = $class. $type. $function;
		preg_match_all('~[\r\n]++ [\x20\t]++ \* [\x20\t]++[\x20\t]++\K ( [_a-z]++[_a-z\d]*+(?>[|/,][_a-z]+[_a-z\d]*)*+)[\x20\t]++&?+\$([_a-z]++[_a-z\d]*+)~sixSX', $doc, $params, PREG_SET_ORDER);
		$parameters = $r->getParameters();
		if (count($parameters) > count($params))
		{
			$message = 'phpDoc %d piece(s) @param description expected in %s%s%s(), %s given, ' . PHP_EOL
					 . 'called in %s on line %d ' . PHP_EOL
					 . 'and defined in %s on line %d';
			$message = sprintf($message, count($parameters), $class, $type, $function, count($params), $file, $line, $r->getFileName(), $r->getStartLine());
			trigger_error($message, E_USER_NOTICE);
		}
		foreach ($args as $i => $value)
		{
			if (! isset($params[$i])) return true;
			if ($parameters[$i]->name !== $params[$i][2])
			{
				$param_num = $i + 1;
				$message = 'phpDoc @param %d in %s%s%s() must be named as $%s, $%s given, ' . PHP_EOL
						 . 'called in %s on line %d ' . PHP_EOL
						 . 'and defined in %s on line %d';
				$message = sprintf($message, $param_num, $class, $type, $function, $parameters[$i]->name, $params[$i][2], $file, $line, $r->getFileName(), $r->getStartLine());
				trigger_error($message, E_USER_NOTICE);
			}

			$hints = preg_split('~[|/,]~sSX', $params[$i][1]);
			if (! self::checkValueTypes($hints, $value))
			{
				$param_num = $i + 1;
				$message = 'Argument %d passed to %s%s%s() must be an %s, %s given, ' . PHP_EOL
						 . 'called in %s on line %d ' . PHP_EOL
						 . 'and defined in %s on line %d';
				$message = sprintf($message, $param_num, $class, $type, $function, implode('|', $hints), (is_object($value) ? get_class($value) . ' ' : '') . gettype($value), $file, $line, $r->getFileName(), $r->getStartLine());
				trigger_error($message, E_USER_WARNING);
				return false;
			}
		}
		return true;
	}

	public static function debugBacktrace($re_ignore = null, $return_frame = null)
	{
		$trace = debug_backtrace();

		$a = array();
		$frames = 0;
		for ($i = 0, $n = count($trace); $i < $n; $i++)
		{
			$t = $trace[$i];
			if (! $t) continue;

			$next = isset($trace[$i+1])? $trace[$i+1] : null;

			if (! isset($t['file']) && $next)
			{
				$t['over_function'] = $trace[$i+1]['function'];
				$t = $t + $trace[$i+1];
				$trace[$i+1] = null;
			}

			if (++$frames < 2) continue;

			if ($re_ignore && $next)
			{
				$frame_caller = (isset($next['class']) ? $next['class'] . $next['type'] : '')
							  . (isset($next['function']) ? $next['function'] : '');
				if (preg_match($re_ignore, $frame_caller)) continue;
			}

			if (count($a) === $return_frame) return $t;
			$a[] = $t;
		}
		return $a;
	}

	public static function checkValueTypes(array $types, $value)
	{
		foreach ($types as $type)
		{
			$type = strtolower($type);
			if (array_key_exists($type, self::$hints) && call_user_func(self::$hints[$type], $value)) return true;
			if (is_object($value) && @is_a($value, $type)) return true;
			if ($type === 'mixed') return true;
		}
		return false;
	}
}
